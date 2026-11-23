export class DbTable
{
	constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet) {}

	getRows(): Array<Record<string, any>>
	{
		const data = this.sheet.getDataRange().getValues();
		if (!data || data.length === 0)
		{
			return [];
		}

		const headers = data[0].map(h => String(h).trim());
		const rows: Array<Record<string, any>> = [];

		for (let i = 1; i < data.length; i++)
		{
			const rowValues = data[i];
			const isEmptyRow = rowValues.every(val => val === '' || val === null || val === undefined);
			if (isEmptyRow)
			{
				continue;
			}

			const rowObj: Record<string, any> = {};
			for (let j = 0; j < headers.length; j++)
			{
				const header = headers[j];
				if (header)
				{
					rowObj[header] = rowValues[j] !== undefined ? rowValues[j] : '';
				}
			}
			rows.push(rowObj);
		}

		return rows;
	}
}

export class Db
{
	constructor(private spreadsheetId: string)
	{
		(this as any).spreadsheet = null;
	}

	getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet
	{
		let spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null = (this as any).spreadsheet;
		if (!spreadsheet)
		{
			spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
			(this as any).spreadsheet = spreadsheet;
		}
		return spreadsheet;
	}

	getTable(tableName: string): DbTable
	{
		const ss = this.getSpreadsheet();
		const sheet = ss.getSheetByName(tableName);
		if (!sheet)
		{
			throw new Error('Table (sheet) "' + tableName + '" not found in database spreadsheet.');
		}
		return new DbTable(sheet);
	}
}
