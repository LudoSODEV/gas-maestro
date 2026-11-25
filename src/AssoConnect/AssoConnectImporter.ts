import { Session } from '../Session';

export class AssoConnectImporter
{
	static importStructures(fileId: string)
	{
		const targetSs = Session.getDb().getSpreadsheet();
		const sourceSs = SpreadsheetApp.openById(fileId);
		const sourceSheet = sourceSs.getSheets()[0];
		const rows = sourceSheet.getDataRange().getValues();

		if (rows.length === 0)
		{
			return { success: true, count: 0, message: 'Aucune donnée à importer.' };
		}

		let targetSheet = targetSs.getSheetByName('AssoConnect_Structures');
		if (!targetSheet)
		{
			targetSheet = targetSs.insertSheet('AssoConnect_Structures');
		}

		targetSheet.clear();
		rows.forEach(row =>
		{
			targetSheet.appendRow(row);
		});

		try
		{
			Drive.Files.remove(fileId);
		}
		catch (e) {}

		return {
			success: true,
			count: rows.length,
			message: `Importation des structures AssoConnect réussie (${rows.length} lignes).`
		};
	}

	static importUsers(fileId: string)
	{
		const targetSs = Session.getDb().getSpreadsheet();
		const sourceSs = SpreadsheetApp.openById(fileId);
		const sourceSheet = sourceSs.getSheets()[0];
		const rows = sourceSheet.getDataRange().getValues();

		if (rows.length === 0)
		{
			return { success: true, count: 0, message: 'Aucune donnée à importer.' };
		}

		let targetSheet = targetSs.getSheetByName('AssoConnect_Users');
		if (!targetSheet)
		{
			targetSheet = targetSs.insertSheet('AssoConnect_Users');
		}

		targetSheet.clear();
		rows.forEach(row =>
		{
			targetSheet.appendRow(row);
		});

		try
		{
			Drive.Files.remove(fileId);
		}
		catch (e) {}

		return {
			success: true,
			count: rows.length,
			message: `Importation des utilisateurs AssoConnect réussie (${rows.length} lignes).`
		};
	}
}
