import { AbstractFileSniffer, SniffResult } from './AbstractFileSniffer';

export class CsvFileSniffer extends AbstractFileSniffer
{
	sniff(fileId: string, fileName: string): SniffResult | null
	{
		const lowerName = fileName.toLowerCase();
		if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt'))
		{
			return {
				detectedType: 'Fichier Texte / CSV',
				availableActions: [{
					type: 'IMPORT_GENERIC_CSV',
					label: 'Importer fichier texte/CSV'
				}]
			};
		}

		return null;
	}
}
