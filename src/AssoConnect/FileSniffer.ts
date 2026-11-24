import { AbstractFileSniffer, SniffResult } from '../AbstractFileSniffer';

export class AssoConnectFileSniffer extends AbstractFileSniffer
{
	sniff(fileId: string, fileName: string): SniffResult | null
	{
		const lowerName = fileName.toLowerCase();
		try
		{
			const ss = SpreadsheetApp.openById(fileId);
			const sheets = ss.getSheets();
			const sheetNames = sheets.map(s => s.getName());

			const hasExport1 = sheetNames.some(n => n.toLowerCase().includes('export 1') || n.toLowerCase().includes('assoconnect'));
			if (!hasExport1 && !lowerName.includes('assoconnect') && !lowerName.includes('export'))
			{
				return null;
			}

			const sheet = sheets[0];
			const data = sheet.getDataRange().getValues();
			let headerRow: string[] = [];
			if (data.length > 0)
			{
				headerRow = data[0].map(cell => String(cell).toLowerCase());
			}

			const isStructure = headerRow.some(h => h.includes('siret') || h.includes('car') || h.includes('structure') || h.includes('antenne'));
			const isMember = headerRow.some(h => h.includes('adhérent') || h.includes('prenom') || h.includes('prénom') || h.includes('cotisation'));

			if (isStructure || (!isMember && lowerName.includes('structure')))
			{
				return {
					detectedType: 'AssoConnect (Structures)',
					availableActions: [{
						type: 'IMPORT_ASSOCONNECT_STRUCTURES',
						label: 'Import AssoConnect structures'
					}]
				};
			}

			return {
				detectedType: 'AssoConnect (Membres / Autre)',
				availableActions: [{
					type: 'IMPORT_ASSOCONNECT_MEMBERS',
					label: 'Import AssoConnect membres'
				}]
			};
		}
		catch (e)
		{
			return null;
		}
	}
}
