import { DbManager } from './DbManager';

export const Webapp = {
	doGet(e: any)
	{
		const params = e && e.parameter ? e.parameter : {};
		const template = HtmlService.createTemplateFromFile('index');

		(template as any).initialParams = JSON.stringify(params);
		(template as any).deploymentUrl = ScriptApp.getService().getUrl();

		return template.evaluate()
			.setTitle('Maestro - Centre de Contrôle')
			.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
	},

	getUserDbs(): Array<{ dbKey: string; dbId: string; name?: string }>
	{
		const props = PropertiesService.getUserProperties();
		const rawData = props.getProperty('MAESTRO_DATABASES');

		let dbs: Array<{ dbKey: string; dbId: string; name?: string }> = [];
		if (rawData)
		{
			try
			{
				dbs = JSON.parse(rawData);
			}
			catch (e)
			{
				dbs = [];
			}
		}

		dbs.forEach(db =>
		{
			if (db.dbId && !db.dbId.startsWith('mock'))
			{
				const meta = DbManager.getFileMetadata(db.dbId);
				db.name = meta.name;
			}
			else
			{
				db.name = 'Maestro DB ' + db.dbKey;
			}
		});

		return dbs;
	},

	saveUserDbs(dbs: Array<{ dbKey: string; dbId: string; name?: string }>)
	{
		const regex = /^[\w\.]{4,32}$/;
		const resolvedDbs: Array<{ dbKey: string; dbId: string }> = [];

		dbs.forEach(d =>
		{
			const normalizedDbKey = (d.dbKey || '').toLowerCase();
			if (!regex.test(normalizedDbKey))
			{
				throw new Error(`Clé de base de données invalide "${d.dbKey}" (doit respecter /^[\w\\.]{4,32}$/).`);
			}

			let dbId = d.dbId ? d.dbId.trim() : '';

			if (!dbId)
			{
				const created = DbManager.createDb(normalizedDbKey, d.name);
				dbId = created.dbId;
			}
			else if (!dbId.startsWith('mock'))
			{
				try
				{
					const updateResource: any = {
						properties: {
							MAESTRO_DATABASE_KEY: normalizedDbKey
						}
					};
					if (d.name)
					{
						updateResource.name = d.name;
					}
					Drive.Files.update(updateResource, dbId);
				}
				catch (e) {}
			}

			resolvedDbs.push({
				dbKey: normalizedDbKey,
				dbId: dbId
			});
		});

		const props = PropertiesService.getUserProperties();
		props.setProperty('MAESTRO_DATABASES', JSON.stringify(resolvedDbs));
		return { success: true, dbs: Webapp.getUserDbs() };
	},

	getActiveDbKey(): string
	{
		const props = PropertiesService.getUserProperties();
		const active = props.getProperty('MAESTRO_ACTIVE_DB');
		if (active)
		{
			return active;
		}
		const dbs = Webapp.getUserDbs();
		if (dbs.length > 0)
		{
			return dbs[0].dbKey;
		}
		return 'demo';
	},

	setActiveDbKey(dbKey: string)
	{
		const props = PropertiesService.getUserProperties();
		props.setProperty('MAESTRO_ACTIVE_DB', dbKey.toLowerCase());
		return { success: true };
	},

	trashDb(dbId: string)
	{
		DbManager.trashDb(dbId);
		const dbs = Webapp.getUserDbs();
		const filtered = dbs.filter(d => d.dbId !== dbId);
		Webapp.saveUserDbs(filtered);
		return { success: true };
	},

	getCurrentUserEmail()
	{
		return Session.getActiveUser().getEmail() || 'Unknown user';
	},

	getDefaultDbInfo()
	{
		const email = Session.getActiveUser().getEmail() || '';
		const match = email.match(/^(ba[0-9]+|demo|[a-z0-9]+)\./i);
		const dbKey = match ? match[1].toLowerCase() : 'demo';
		const name = 'Maestro DB ' + dbKey;
		return { dbKey, name };
	},

	listAccessibleDbs()
	{
		return DbManager.listAccessibleDbs();
	},

	searchAutoDb()
	{
		const email = Session.getActiveUser().getEmail() || '';
		const match = email.match(/^(ba[0-9]+)\./i);

		if (!match)
		{
			throw new Error('User email not recognized for automatic database search (expected format: baXXX.*)');
		}

		const dbKey = match[1].toLowerCase();

		const dbs = Webapp.getUserDbs();
		let db = dbs.find((d: { dbKey: string }) => d.dbKey === dbKey);

		if (db)
		{
			return db;
		}

		db = DbManager.findDbByKey(dbKey);
		if (db)
		{
			if (!dbs.some((d: { dbKey: string }) => d.dbKey === dbKey))
			{
				dbs.push(db);
				Webapp.saveUserDbs(dbs);
			}
			return db;
		}

		return null;
	},

	createAutoDb(customDbKey?: string, customName?: string)
	{
		let dbKey = customDbKey;
		let name = customName;

		if (!dbKey)
		{
			const email = Session.getActiveUser().getEmail() || '';
			const match = email.match(/^(ba[0-9]+|demo|[a-z0-9]+)\./i);
			dbKey = match ? match[1].toLowerCase() : 'demo';
		}

		dbKey = dbKey.toLowerCase();
		if (!name)
		{
			name = 'Maestro DB ' + dbKey;
		}

		const dbs = Webapp.getUserDbs();
		let db = dbs.find((d: { dbKey: string }) => d.dbKey === dbKey);

		if (!db)
		{
			const created = DbManager.createDb(dbKey, name);
			db = {
				dbKey: created.dbKey,
				dbId: created.dbId,
				name: name
			};
			dbs.push(db);
			Webapp.saveUserDbs(dbs);
		}

		return db;
	}
};
