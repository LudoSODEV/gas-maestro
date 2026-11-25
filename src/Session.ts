import { Webapp } from './Webapp';
import { Db } from './db';

let cachedDb: Db | null = null;
let cachedDbId: string | null = null;

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
		if (found && found.dbId)
		{
			PropertiesService.getUserProperties().setProperty('MAESTRO_ACTIVE_DB_ID', found.dbId);
		}
		cachedDb = null;
		cachedDbId = null;
	}

	static getActiveDbId(): string
	{
		const props = PropertiesService.getUserProperties();
		let activeDbId = props.getProperty('MAESTRO_ACTIVE_DB_ID') || props.getProperty('MAESTRO_ACTIVE_SPREADSHEET');
		if (activeDbId)
		{
			return activeDbId;
		}

		const dbKey = Webapp.getActiveDbKey();
		const dbs = Webapp.getUserDbs();
		const found = dbs.find(d => d.dbKey.toLowerCase() === dbKey.toLowerCase());
		if (found && found.dbId)
		{
			props.setProperty('MAESTRO_ACTIVE_DB_ID', found.dbId);
			return found.dbId;
		}

		try
		{
			const autoDb = Webapp.searchAutoDb() || Webapp.createAutoDb();
			if (autoDb && autoDb.dbId)
			{
				props.setProperty('MAESTRO_ACTIVE_DB_ID', autoDb.dbId);
				return autoDb.dbId;
			}
		}
		catch (e)
		{
		}

		throw new Error('Aucun identifiant de base de données (dbId) actif trouvé.');
	}

	static getDb(): Db
	{
		const dbId = Session.getActiveDbId();
		if (!cachedDb || cachedDbId !== dbId)
		{
			cachedDb = new Db(dbId);
			cachedDbId = dbId;
		}
		return cachedDb;
	}
}
