export class InspectableFile
{
	constructor(public readonly file: GoogleAppsScript.Drive.File)
	{
		(this as any)._spreadsheet = null;
		(this as any)._spreadsheetLoaded = false;
	}

	get id(): string
	{
		return this.file.getId();
	}

	get mimeType(): string
	{
		return this.file.getMimeType();
	}

	get isSpreadsheet(): boolean
	{
		return this.mimeType === MimeType.GOOGLE_SHEETS;
	}

	/**
	 * Lazily opens and caches the Spreadsheet instance.
	 * Subsequent calls across different sniffers return the cached reference in 0ms.
	 */
	getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet | null
	{
		const isSpreadsheet = this.isSpreadsheet;
		if (!isSpreadsheet)
		{
			return null;
		}

		let spreadsheetLoaded = (this as any)._spreadsheetLoaded;
		if (!spreadsheetLoaded)
		{
			(this as any)._spreadsheet = SpreadsheetApp.openById(this.id);
			(this as any)._spreadsheetLoaded = true;
		}

		return (this as any)._spreadsheet;
	}
}

export interface InspectableFileSniffer
{
	readonly name: string;
	supports(context: InspectableFile): boolean;
}

export class InvoiceSheetSniffer implements InspectableFileSniffer
{
	readonly name = 'InvoiceSheetSniffer';

	supports(context: InspectableFile): boolean
	{
		if (!context.isSpreadsheet)
		{
			return false;
		}

		const ss = context.getSpreadsheet();
		if (!ss)
		{
			return false;
		}

		return ss.getSheetByName('Invoices') !== null;
	}
}

export class TimesheetSniffer implements InspectableFileSniffer
{
	readonly name = 'TimesheetSniffer';

	supports(context: InspectableFile): boolean
	{
		if (!context.isSpreadsheet)
		{
			return false;
		}

		const ss = context.getSpreadsheet();
		if (!ss)
		{
			return false;
		}

		const range = ss.getRange('A1');
		return range ? range.getValue() === 'Employee ID' : false;
	}
}
