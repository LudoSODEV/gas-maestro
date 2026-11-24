import { AbstractFileSniffer } from '../FileSniffer';

export class AssoConnectFileSniffer extends AbstractFileSniffer
{
	getAvailableActions(file: GoogleAppsScript.Drive.File): string[]
	{
		return [
			'STUB_ACTION_ASSOCONNECT_IMPORT_MEMBERS',
			'STUB_ACTION_ASSOCONNECT_IMPORT_CONTRIBUTIONS'
		];
	}
}
