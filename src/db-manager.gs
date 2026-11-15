/**
 * DbManager class
 * Handles creation and management of Database Google Sheets.
 */
Maestro.DbManager = class DbManager
{
	static createDb (dbKey, dbName)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		const resolvedDbName = dbName ? dbName.toUpperCase() : normalizedDbKey.toUpperCase();
		
		const ss = SpreadsheetApp.create('Database - ' + resolvedDbName + ' (' + normalizedDbKey + ')');
		const spreadsheetId = ss.getId();
		
		// Tag file with MAESTRO_DATABASE_KEY property
		try
		{
			Drive.Properties.insert
			({
				key: 'MAESTRO_DATABASE_KEY',
				value: normalizedDbKey,
				visibility: 'PUBLIC'
			}, spreadsheetId);
		}
		catch (e)
		{
			try
			{
				const file = DriveApp.getFileById(spreadsheetId);
				file.setDescription('MAESTRO_DATABASE_KEY: ' + normalizedDbKey);
			}
			catch (err)
			{
				// Ignore fallback description failure
			}
		}
		
		// Initialize Parameters sheet
		const sheets = ss.getSheets();
		let parametersSheet;
		
		if (sheets.length > 0)
		{
			parametersSheet = sheets[0];
			parametersSheet.setName('Parameters');
		}
		else
		{
			parametersSheet = ss.insertSheet('Parameters');
		}
		
		parametersSheet.clear();
		parametersSheet.appendRow(['Key', 'Value']);
		parametersSheet.appendRow(['dbKey', normalizedDbKey]);
		parametersSheet.appendRow(['dbName', resolvedDbName]);
		
		// Format Parameters sheet header
		const headerRange = parametersSheet.getRange(1, 1, 1, 2);
		headerRange.setFontWeight('bold');
		
		// Apply soft protections to all sheets
		const allSheets = ss.getSheets();
		allSheets.forEach(sheet =>
		{
			const protection = sheet.protect().setDescription('Prevent accidental modifications');
			protection.setWarningOnly(true);
		});
		
		return {
			dbKey: normalizedDbKey,
			dbName: resolvedDbName,
			spreadsheetId: spreadsheetId
		};
	}

	static findDbByKey (dbKey)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		
		try
		{
			const query = 'properties has { key=\'MAESTRO_DATABASE_KEY\' and value=\'' + normalizedDbKey + '\' and visibility=\'PUBLIC\' } and trashed = false';
			const result = Drive.Files.list({ q: query });
			
			if (result && result.items && result.items.length > 0)
			{
				const fileItem = result.items[0];
				return {
					dbKey: normalizedDbKey,
					dbName: normalizedDbKey.toUpperCase(),
					spreadsheetId: fileItem.id
				};
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
					if (file.getName().toLowerCase().includes(normalizedDbKey) || file.getDescription().includes(normalizedDbKey))
					{
						return {
							dbKey: normalizedDbKey,
							dbName: normalizedDbKey.toUpperCase(),
							spreadsheetId: file.getId()
						};
					}
				}
			}
			catch (err)
			{
				// Ignore search fallback failure
			}
		}
		
		return null;
	}

	static getOrCreateDb (dbKey, dbName)
	{
		let db = Maestro.DbManager.findDbByKey(dbKey);
		
		if (!db)
		{
			db = Maestro.DbManager.createDb(dbKey, dbName);
		}
		
		return db;
	}
};
