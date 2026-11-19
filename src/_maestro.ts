import { DbManager } from './db-manager';
import { Webapp } from './webapp';
import { FileSniffer } from './file-sniffers/file-sniffer';
import { AssoConnectFileSniffer } from './file-sniffers/asso-connect-file-sniffer';

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

// Expose entry points to globalThis for Google Apps Script execution
(globalThis as any).doGet = doGet;
(globalThis as any).Maestro_getUserDbs = Maestro_getUserDbs;
(globalThis as any).Maestro_saveUserDbs = Maestro_saveUserDbs;
(globalThis as any).Maestro_getCurrentUserEmail = Maestro_getCurrentUserEmail;
(globalThis as any).Maestro_listAccessibleDbs = Maestro_listAccessibleDbs;
(globalThis as any).Maestro_getOrCreateAutoDb = Maestro_getOrCreateAutoDb;
