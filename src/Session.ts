import { DbManager } from './DbManager';
import { Webapp } from './Webapp';

export class Session
{
	static getCurrentUserEmail(): string
	{
		return Webapp.getCurrentUserEmail();
	}

	static getActiveDbKey(): string
	{
		return Webapp.getActiveDbKey();
	}

	static setActiveDbKey(dbKey: string): void
	{
		Webapp.setActiveDbKey(dbKey);
		const dbs = Webapp.getUserDbs();
		const found = dbs.find(d => d.dbKey.toLowerCase() === dbKey.toLowerCase());
		if (found && found.spreadsheetId)
		{
			PropertiesService.getUserProperties().setProperty('MAESTRO_ACTIVE_SPREADSHEET', found.spreadsheetId);
		}
	}

	static getActiveSpreadsheetId(): string
	{
		const props = PropertiesService.getUserProperties();
		const activeSpreadsheetId = props.getProperty('MAESTRO_ACTIVE_SPREADSHEET');
		if (activeSpreadsheetId)
		{
			return activeSpreadsheetId;
		}

		const dbKey = Webapp.getActiveDbKey();
		const dbs = Webapp.getUserDbs();
		const found = dbs.find(d => d.dbKey.toLowerCase() === dbKey.toLowerCase());
		if (found && found.spreadsheetId)
		{
			props.setProperty('MAESTRO_ACTIVE_SPREADSHEET', found.spreadsheetId);
			return found.spreadsheetId;
		}

		try
		{
			const autoDb = Webapp.searchAutoDb() || Webapp.createAutoDb();
			if (autoDb && autoDb.spreadsheetId)
			{
				props.setProperty('MAESTRO_ACTIVE_SPREADSHEET', autoDb.spreadsheetId);
				return autoDb.spreadsheetId;
			}
		}
		catch (e) {}

		throw new Error('Aucun identifiant de feuille de calcul (spreadsheetId) actif trouvé.');
	}

	static getCurrentDb(): GoogleAppsScript.Spreadsheet.Spreadsheet
	{
		const spreadsheetId = Session.getActiveSpreadsheetId();
		return SpreadsheetApp.openById(spreadsheetId);
	}
}
