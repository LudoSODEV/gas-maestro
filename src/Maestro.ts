import { DbManager } from './DbManager';
import { Webapp } from './Webapp';
import { FileSniffer } from './FileSniffers/FileSniffer';
import { AssoConnectFileSniffer } from './FileSniffers/AssoConnectFileSniffer';
import { ImportManager } from './ImportManager';
import { Session } from './Session';

const Maestro = {
	DbManager,
	Webapp,
	ImportManager,
	Session,
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

function Maestro_searchAutoDb()
{
	return Webapp.searchAutoDb();
}

function Maestro_createAutoDb()
{
	return Webapp.createAutoDb();
}

function Maestro_getDefaultDbInfo()
{
	return Webapp.getDefaultDbInfo();
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

function Maestro_stageImportFiles(files: any)
{
	return ImportManager.stageFiles(files);
}

function Maestro_listStagedImports()
{
	return ImportManager.listStagedImports();
}

function Maestro_executeImportAction(fileId: string, actionType: string, targetDbKey?: string)
{
	return ImportManager.executeImportAction(fileId, actionType, targetDbKey);
}

function Maestro_discardImportFile(fileId: string)
{
	return ImportManager.discardImportFile(fileId);
}

// Expose entry points to globalThis for Google Apps Script execution
(globalThis as any).doGet = doGet;
(globalThis as any).Maestro_getUserDbs = Maestro_getUserDbs;
(globalThis as any).Maestro_saveUserDbs = Maestro_saveUserDbs;
(globalThis as any).Maestro_getCurrentUserEmail = Maestro_getCurrentUserEmail;
(globalThis as any).Maestro_listAccessibleDbs = Maestro_listAccessibleDbs;
(globalThis as any).Maestro_searchAutoDb = Maestro_searchAutoDb;
(globalThis as any).Maestro_createAutoDb = Maestro_createAutoDb;
(globalThis as any).Maestro_getActiveDbKey = Maestro_getActiveDbKey;
(globalThis as any).Maestro_setActiveDbKey = Maestro_setActiveDbKey;
(globalThis as any).Maestro_trashDb = Maestro_trashDb;
(globalThis as any).Maestro_stageImportFiles = Maestro_stageImportFiles;
(globalThis as any).Maestro_listStagedImports = Maestro_listStagedImports;
(globalThis as any).Maestro_executeImportAction = Maestro_executeImportAction;
(globalThis as any).Maestro_discardImportFile = Maestro_discardImportFile;
