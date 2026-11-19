import { FileSniffer } from './file-sniffer';

export class AssoConnectFileSniffer extends FileSniffer
{
	getAvailableActions(file: GoogleAppsScript.Drive.File): string[]
	{
		return [
			'STUB_ACTION_ASSOCONNECT_IMPORT_MEMBERS',
			'STUB_ACTION_ASSOCONNECT_IMPORT_CONTRIBUTIONS'
		];
	}
}
