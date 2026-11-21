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

	getUserDbs(): Array<{ dbKey: string; spreadsheetId: string; name?: string }>
	{
		const props = PropertiesService.getUserProperties();
		const rawData = props.getProperty('MAESTRO_DATABASES');
		
		let dbs: Array<{ dbKey: string; spreadsheetId: string; name?: string }> = [];
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
			if (db.spreadsheetId && !db.spreadsheetId.startsWith('mock'))
			{
				const meta = DbManager.getFileMetadata(db.spreadsheetId);
				db.name = meta.name;
			}
			else
			{
				db.name = 'Maestro DB ' + db.dbKey;
			}
		});
		
		return dbs;
	},

	saveUserDbs(dbs: Array<{ dbKey: string; spreadsheetId: string; name?: string }>)
	{
		const props = PropertiesService.getUserProperties();
		// Clean up transient name property before saving
		const cleanDbs = dbs.map(d => ({ dbKey: d.dbKey, spreadsheetId: d.spreadsheetId }));
		props.setProperty('MAESTRO_DATABASES', JSON.stringify(cleanDbs));
		return { success: true };
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
		return 'ba13';
	},

	setActiveDbKey(dbKey: string)
	{
		const props = PropertiesService.getUserProperties();
		props.setProperty('MAESTRO_ACTIVE_DB', dbKey.toLowerCase());
		return { success: true };
	},

	trashDb(spreadsheetId: string, dbKey?: string)
	{
		DbManager.trashDb(spreadsheetId);
		const dbs = Webapp.getUserDbs();
		const filtered = dbs.filter(d => d.spreadsheetId !== spreadsheetId && (!dbKey || d.dbKey !== dbKey));
		Webapp.saveUserDbs(filtered);
		return { success: true };
	},

	getCurrentUserEmail()
	{
		return Session.getActiveUser().getEmail() || 'Unknown user';
	},

	listAccessibleDbs()
	{
		return DbManager.listAccessibleDbs();
	},

	getOrCreateAutoDb()
	{
		const email = Session.getActiveUser().getEmail() || '';
		const match = email.match(/^(ba[0-9]+)\./i);
		
		if (!match)
		{
			throw new Error('User email not recognized for automatic database generation (expected format: baXX.*)');
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
		
		db = DbManager.createDb(dbKey);
		if (!dbs.some((d: { dbKey: string }) => d.dbKey === dbKey))
		{
			dbs.push(db);
			Webapp.saveUserDbs(dbs);
		}
		
		return db;
	}
};
