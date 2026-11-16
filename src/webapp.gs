/**
 * Webapp module
 * Handles web app routing, user properties management, and database automation.
 */
Maestro.Webapp = {
	doGet (e)
	{
		const params = e && e.parameter ? e.parameter : {};
		const template = HtmlService.createTemplateFromFile('index');
		
		template.initialParams = JSON.stringify(params);
		template.deploymentUrl = ScriptApp.getService().getUrl();
		
		return template.evaluate()
			.setTitle('Maestro - Centre de Contrôle')
			.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
	},

	getUserDbs ()
	{
		const props = PropertiesService.getUserProperties();
		const rawData = props.getProperty('MAESTRO_DATABASES');
		
		if (rawData)
		{
			return JSON.parse(rawData);
		}
		
		return [];
	},

	saveUserDbs (dbs)
	{
		const props = PropertiesService.getUserProperties();
		props.setProperty('MAESTRO_DATABASES', JSON.stringify(dbs));
		return { success: true };
	},

	getCurrentUserEmail ()
	{
		return Session.getActiveUser().getEmail() || 'Unknown user';
	},

	getOrCreateAutoDb ()
	{
		const email = Session.getActiveUser().getEmail() || '';
		const match = email.match (/^(ba[0-9]+)\./i);
		
		if (!match)
		{
			throw new Error('User email not recognized for automatic database generation (expected format: baXX.*)');
		}
		
		const dbKey = match[1].toLowerCase();
		const dbName = dbKey.toUpperCase();
		
		const dbs = Maestro.Webapp.getUserDbs();
		let db = dbs.find(d => d.dbKey === dbKey);
		
		if (db)
		{
			return db;
		}
		
		// Search Google Drive for existing database with matching MAESTRO_DATABASE_KEY property
		try
		{
			const query = 'properties has { key=\'MAESTRO_DATABASE_KEY\' and value=\'' + dbKey + '\' and visibility=\'PUBLIC\' } and trashed = false';
			const result = Drive.Files.list({ q: query });
			
			if (result && result.items && result.items.length > 0)
			{
				const fileItem = result.items[0];
				db = {
					dbKey: dbKey,
					dbName: dbName,
					spreadsheetId: fileItem.id
				};
				dbs.push(db);
				Maestro.Webapp.saveUserDbs(dbs);
				return db;
			}
		}
		catch (e)
		{
			try
			{
				const files = DriveApp.searchFiles('trashed = false');
				while (files.hasNext())
				{
					const file = files.next();
					if (file.getName().toLowerCase().includes(dbKey) || file.getDescription().includes(dbKey))
					{
						db = {
							dbKey: dbKey,
							dbName: dbName,
							spreadsheetId: file.getId()
						};
						dbs.push(db);
						Maestro.Webapp.saveUserDbs(dbs);
						return db;
					}
				}
			}
			catch (err)
			{
				// Ignore search fallback failure and proceed to creation
			}
		}
		
		db = Maestro.DbManager.getOrCreateDb(dbKey, dbName);
		if (!dbs.some(d => d.dbKey === dbKey))
		{
			dbs.push(db);
			Maestro.Webapp.saveUserDbs(dbs);
		}
		
		return db;
	}
};
