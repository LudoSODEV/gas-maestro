import { DbManager } from './db-manager';
import { Webapp } from './webapp';
import { FileSniffer } from './file-sniffers/file-sniffer';
import { AssoConnectFileSniffer } from './file-sniffers/asso-connect-file-sniffer';

declare const global: any;

const Maestro = {
	DbManager,
	Webapp,
	FileSniffers: {
		FileSniffer,
		AssoConnectFileSniffer
	}
};

(global as any).Maestro = Maestro;

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
