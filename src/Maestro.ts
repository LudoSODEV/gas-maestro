import { DbManager } from './DbManager';
import { Webapp } from './Webapp';
import { FileSniffer } from './FileSniffers/FileSniffer';
import { AssoConnectFileSniffer } from './FileSniffers/AssoConnectFileSniffer';

const Maestro = {
	DbManager,
	Webapp,
	FileSniffers: {
		FileSniffer,
		AssoConnectFileSniffer
	}
};

(globalThis as any).Maestro = Maestro;

function doGet(e: GoogleAppsScript.Events.AppsScriptEvent)
{
	return Webapp.doGet(e);
}

function Maestro_getUserDbs()
{
	return Webapp.getUserDbs();
}

function Maestro_saveUserDbs(dbs: any)
{
	return Webapp.saveUserDbs(dbs);
}

function Maestro_getCurrentUserEmail()
{
	return Webapp.getCurrentUserEmail();
}

function Maestro_listAccessibleDbs()
{
	return Webapp.listAccessibleDbs();
}

function Maestro_getOrCreateAutoDb()
{
	return Webapp.getOrCreateAutoDb();
}

function Maestro_getActiveDbKey()
{
	return Webapp.getActiveDbKey();
}

function Maestro_setActiveDbKey(dbKey: string)
{
	return Webapp.setActiveDbKey(dbKey);
}

function Maestro_trashDb(spreadsheetId: string, dbKey?: string)
{
	return Webapp.trashDb(spreadsheetId, dbKey);
}

// Expose entry points to globalThis for Google Apps Script execution
(globalThis as any).doGet = doGet;
(globalThis as any).Maestro_getUserDbs = Maestro_getUserDbs;
(globalThis as any).Maestro_saveUserDbs = Maestro_saveUserDbs;
(globalThis as any).Maestro_getCurrentUserEmail = Maestro_getCurrentUserEmail;
(globalThis as any).Maestro_listAccessibleDbs = Maestro_listAccessibleDbs;
(globalThis as any).Maestro_getOrCreateAutoDb = Maestro_getOrCreateAutoDb;
(globalThis as any).Maestro_getActiveDbKey = Maestro_getActiveDbKey;
(globalThis as any).Maestro_setActiveDbKey = Maestro_setActiveDbKey;
(globalThis as any).Maestro_trashDb = Maestro_trashDb;
