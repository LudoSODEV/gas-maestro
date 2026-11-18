/**
 * Webapp module
 * Handles web app routing, user properties management, and database automation.
 */
Maestro.Webapp = {
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

	getUserDbs(): Array<{ dbKey: string; spreadsheetId: string }>
	{
		const props = PropertiesService.getUserProperties();
		const rawData = props.getProperty('MAESTRO_DATABASES');
		
		if (rawData)
		{
			return JSON.parse(rawData);
		}
		
		return [];
	},

	saveUserDbs(dbs: Array<{ dbKey: string; spreadsheetId: string }>)
	{
		const props = PropertiesService.getUserProperties();
		props.setProperty('MAESTRO_DATABASES', JSON.stringify(dbs));
		return { success: true };
	},

	getCurrentUserEmail()
	{
		return Session.getActiveUser().getEmail() || 'Unknown user';
	},

	listAccessibleDbs()
	{
		return Maestro.DbManager.listAccessibleDbs();
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
		
		const dbs = Maestro.Webapp.getUserDbs();
		let db = dbs.find((d: { dbKey: string }) => d.dbKey === dbKey);
		
		if (db)
		{
			return db;
		}
		
		// Search Google Drive for existing database using custom property exclusively (no fallback)
		db = Maestro.DbManager.findDbByKey(dbKey);
		if (db)
		{
			if (!dbs.some((d: { dbKey: string }) => d.dbKey === dbKey))
			{
				dbs.push(db);
				Maestro.Webapp.saveUserDbs(dbs);
			}
			return db;
		}
		
		db = Maestro.DbManager.createDb(dbKey);
		if (!dbs.some((d: { dbKey: string }) => d.dbKey === dbKey))
		{
			dbs.push(db);
			Maestro.Webapp.saveUserDbs(dbs);
		}
		
		return db;
	}
};
