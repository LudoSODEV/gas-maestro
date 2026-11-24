import { AbstractFileSniffer, SniffResult } from './AbstractFileSniffer';

export class GenericSpreadsheetFileSniffer extends AbstractFileSniffer
{
	sniff(fileId: string, fileName: string): SniffResult | null
	{
		try
		{
			const ss = SpreadsheetApp.openById(fileId);
			const sheets = ss.getSheets();
			if (sheets.length === 0)
			{
				return null;
			}

			return {
				detectedType: 'Fichier Tableur Général',
				availableActions: [{
					type: 'IMPORT_GENERIC_SPREADSHEET',
					label: 'Importer dans la base active'
				}]
			};
		}
		catch (e)
		{
			return null;
		}
	}
}
