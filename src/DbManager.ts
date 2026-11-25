export class DbManager
{
	static createDb(dbKey: string, name?: string)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		const regex = /^\w{4,32}$/;
		if (!regex.test(normalizedDbKey))
		{
			throw new Error(`Clé de base de données invalide "${dbKey}" (entre 4 et 32 caractères: lettres, nombres, ou tirets).`);
		}

		const docName = name || ('Maestro DB ' + normalizedDbKey);
		const ss = SpreadsheetApp.create(docName);
		const dbId = ss.getId();

		Drive.Files.update({
			name: docName,
			properties: {
				MAESTRO_DATABASE_KEY: normalizedDbKey
			}
		}, dbId);

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
			dbId: dbId
		};
	}

	static findDbByKey(dbKey: string)
	{
		const normalizedDbKey = dbKey.toLowerCase();
		const query = "properties has { key='MAESTRO_DATABASE_KEY' and value='" + normalizedDbKey + "' } and trashed = false";
		const result = Drive.Files.list({ q: query });

		if (result && result.files && result.files.length > 0)
		{
			const fileItem = result.files[0];
			return {
				dbKey: normalizedDbKey,
				dbId: fileItem.id!
			};
		}

		return null;
	}

	static listAccessibleDbs()
	{
		const query = "properties has { key='MAESTRO_DATABASE_KEY' } and trashed = false";
		const result = Drive.Files.list({ q: query });
		const dbs: Array<{ dbKey: string; dbId: string }> = [];

		if (result && result.files)
		{
			result.files.forEach((item: any) =>
			{
				if (item.properties && item.properties['MAESTRO_DATABASE_KEY'])
				{
					dbs.push({
						dbKey: item.properties['MAESTRO_DATABASE_KEY'].toLowerCase(),
						dbId: item.id!
					});
				}
			});
		}

		return dbs;
	}

	static getFileMetadata(dbId: string)
	{
		try
		{
			const file = Drive.Files.get(dbId);
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

	static trashDb(dbId: string)
	{
		try
		{
			Drive.Files.update({ trashed: true }, dbId);
			return { success: true };
		}
		catch (e: any)
		{
			throw new Error('Impossible de placer le fichier à la corbeille: ' + e.message);
		}
	}
}
