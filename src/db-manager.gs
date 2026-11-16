/**
 * DbManager class
 * Handles creation and management of Database Google Sheets.
 */
Maestro.DbManager = class DbManager
{
	static createDb (dbKey)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		
		const ss = SpreadsheetApp.create('Maestro DB ' + normalizedDbKey);
		const spreadsheetId = ss.getId();
		
		// Tag file with MAESTRO_DATABASE_KEY custom property (strict, no fallback)
		Drive.Properties.insert
		({
			key: 'MAESTRO_DATABASE_KEY',
			value: normalizedDbKey,
			visibility: 'PUBLIC'
		}, spreadsheetId);
		
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
			spreadsheetId: spreadsheetId
		};
	}

	static findDbByKey (dbKey)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		const query = 'properties has { key=\'MAESTRO_DATABASE_KEY\' and value=\'' + normalizedDbKey + '\' and visibility=\'PUBLIC\' } and trashed = false';
		const result = Drive.Files.list({ q: query });
		
		if (result && result.items && result.items.length > 0)
		{
			const fileItem = result.items[0];
			return {
				dbKey: normalizedDbKey,
				spreadsheetId: fileItem.id
			};
		}
		
		return null;
	}

	static listAccessibleDbs ()
	{
		const query = 'properties has { key=\'MAESTRO_DATABASE_KEY\' and visibility=\'PUBLIC\' } and trashed = false';
		const result = Drive.Files.list({ q: query });
		const dbs = [];
		
		if (result && result.items)
		{
			result.items.forEach(item =>
			{
				if (item.properties)
				{
					const prop = item.properties.find(p => p.key === 'MAESTRO_DATABASE_KEY' && p.visibility === 'PUBLIC');
					if (prop && prop.value)
					{
						dbs.push({
							dbKey: prop.value.toLowerCase(),
							spreadsheetId: item.id
						});
					}
				}
			});
		}
		
		return dbs;
	}

	static getOrCreateDb (dbKey)
	{
		let db = Maestro.DbManager.findDbByKey(dbKey);
		
		if (!db)
		{
			db = Maestro.DbManager.createDb(dbKey);
		}
		
		return db;
	}
};
