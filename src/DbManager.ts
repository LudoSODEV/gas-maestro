export class DbManager
{
	static createDb(dbKey: string)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		
		const ss = SpreadsheetApp.create('Maestro DB ' + normalizedDbKey);
		const spreadsheetId = ss.getId();
		
		(Drive as any).Files.update({
			properties: {
				MAESTRO_DATABASE_KEY: normalizedDbKey
			}
		}, spreadsheetId);
		
		const sheets = ss.getSheets();
		let parametersSheet: GoogleAppsScript.Spreadsheet.Sheet;
		
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
		
		const headerRange = parametersSheet.getRange(1, 1, 1, 2);
		headerRange.setFontWeight('bold');
		
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

	static findDbByKey(dbKey: string)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		const query = "properties has { key='MAESTRO_DATABASE_KEY' and value='" + normalizedDbKey + "' } and trashed = false";
		const result = (Drive as any).Files.list({ q: query });
		
		if (result && result.files && result.files.length > 0)
		{
			const fileItem = result.files[0];
			return {
				dbKey: normalizedDbKey,
				spreadsheetId: fileItem.id!
			};
		}
		
		return null;
	}

	static listAccessibleDbs()
	{
		const query = "properties has { key='MAESTRO_DATABASE_KEY' } and trashed = false";
		const result = (Drive as any).Files.list({ q: query });
		const dbs: Array<{ dbKey: string; spreadsheetId: string }> = [];
		
		if (result && result.files)
		{
			result.files.forEach((item: any) =>
			{
				if (item.properties && item.properties['MAESTRO_DATABASE_KEY'])
				{
					dbs.push({
						dbKey: item.properties['MAESTRO_DATABASE_KEY'].toLowerCase(),
						spreadsheetId: item.id!
					});
				}
			});
		}
		
		return dbs;
	}

	static getFileMetadata(spreadsheetId: string)
	{
		try
		{
			const file = (Drive as any).Files.get(spreadsheetId);
			return {
				name: file.name || 'Sans titre',
				trashed: file.trashed || false
			};
		}
		catch (e)
		{
			return {
				name: 'Fichier introuvable ou accès refusé',
				trashed: false
			};
		}
	}

	static trashDb(spreadsheetId: string)
	{
		try
		{
			(Drive as any).Files.update({ trashed: true }, spreadsheetId);
			return { success: true };
		}
		catch (e: any)
		{
			throw new Error('Impossible de placer le fichier à la corbeille: ' + e.message);
		}
	}
}
