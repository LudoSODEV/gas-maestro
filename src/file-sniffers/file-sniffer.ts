export class FileSniffer
{
	getAvailableActions(file: GoogleAppsScript.Drive.File): string[]
	{
		throw new Error('Method getAvailableActions() must be implemented by concrete file sniffers.');
	}
}
