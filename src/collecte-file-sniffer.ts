import { AbstractFileSniffer, SniffResult } from './AbstractFileSniffer';

export class CollecteFileSniffer extends AbstractFileSniffer
{
	sniff(fileId: string, fileName: string): SniffResult | null
	{
		const lowerName = fileName.toLowerCase();
		try
		{
			const ss = SpreadsheetApp.openById(fileId);
			const sheets = ss.getSheets();
			const sheetNames = sheets.map(s => s.getName());
			const isCollecte = lowerName.includes('collecte') || sheetNames.some(n => n.toLowerCase().includes('collecte') || n.toLowerCase().includes('inscription'));
			if (!isCollecte)
			{
				return null;
			}

			return {
				detectedType: 'Application Collecte (Inscriptions)',
				availableActions: [{
					type: 'IMPORT_COLLECTE_INSCRIPTIONS',
					label: 'Import Collecte (Inscriptions)'
				}]
			};
		}
		catch (e)
		{
			return null;
		}
	}
}
