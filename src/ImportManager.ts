import { DbManager } from './DbManager';
import { AssoConnectImporter } from './AssoConnect/AssoConnectImporter';
import { AbstractFileSniffer } from './AbstractFileSniffer';
import { AssoConnectFileSniffer } from './AssoConnect/FileSniffer';
import { CollecteFileSniffer } from './collecte-file-sniffer';
import { GenericSpreadsheetFileSniffer } from './generic-spreadsheet-file-sniffer';
import { CsvFileSniffer } from './csv-file-sniffer';

export interface StagedItem
{
	fileId: string;
	fileName: string;
	detectedType: string;
	createdTime?: string;
	availableActions: Array<{ type: string; label: string }>;
}

export class ImportManager
{
	static get sniffers(): AbstractFileSniffer[]
	{
		return [
			new AssoConnectFileSniffer(),
			new CollecteFileSniffer(),
			new GenericSpreadsheetFileSniffer(),
			new CsvFileSniffer()
		];
	}

	static isExcelSpreadsheet(mimeType: string): boolean
	{
		const lower = (mimeType || '').toLowerCase();
		return mimeType === MimeType.MICROSOFT_EXCEL || lower.includes('excel') || lower.includes('spreadsheetml');
	}

	static createBinaryTempFile(blob: GoogleAppsScript.Base.Blob, name: string, mimeType: string): string
	{
		const file = Drive.Files.create(
			{
				name: name,
				mimeType: mimeType
			},
			blob,
			{
				fields: 'id'
			}
		);
		return file.id!;
	}

	static convertExcelToGoogleSheets(tempFileId: string, name: string): any
	{
		return Drive.Files.copy(
			{
				name: name,
				mimeType: MimeType.GOOGLE_SHEETS,
				properties: {
					MAESTRO_IMPORT: '1'
				}
			},
			tempFileId,
			{
				fields: 'id, name, createdTime, properties'
			}
		);
	}

	static createStagedSpreadsheet(blob: GoogleAppsScript.Base.Blob, name: string, mimeType: string): any
	{
		if (ImportManager.isExcelSpreadsheet(mimeType))
		{
			const tempFileId = ImportManager.createBinaryTempFile(blob, name, mimeType);
			try
			{
				return ImportManager.convertExcelToGoogleSheets(tempFileId, name);
			}
			finally
			{
				Drive.Files.remove(tempFileId);
			}
		}

		const targetMimeType = (mimeType || '').toLowerCase().includes('spreadsheet') || mimeType === MimeType.GOOGLE_SHEETS
			? MimeType.GOOGLE_SHEETS
			: mimeType;

		return Drive.Files.create(
			{
				name: name,
				mimeType: targetMimeType,
				properties: {
					MAESTRO_IMPORT: '1'
				}
			},
			blob,
			{
				fields: 'id, name, createdTime, properties'
			}
		);
	}

	static stageFile(f: { name: string; mimeType: string; data: string }): StagedItem
	{
		const blob = Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType, f.name);
		const file = ImportManager.createStagedSpreadsheet(blob, f.name, f.mimeType);

		const fileId = file.id;
		const createdTime = file.createdTime || new Date().toISOString();

		const introspection = ImportManager.introspectFile(fileId, f.name);

		// Move to trash after creation and introspection
		Drive.Files.update(
			{
				trashed: true
			},
			fileId,
			null
		);

		return {
			fileId: fileId,
			fileName: f.name,
			detectedType: introspection.detectedType,
			createdTime: createdTime,
			availableActions: introspection.availableActions
		};
	}

	static stageFiles(files: Array<{ name: string; mimeType: string; data: string }>): StagedItem[]
	{
		const results: StagedItem[] = [];

		if (!files || !Array.isArray(files))
		{
			return results;
		}

		files.forEach(f =>
		{
			results.push(ImportManager.stageFile(f));
		});

		return results;
	}

	static listStagedImports(): StagedItem[]
	{
		const items: StagedItem[] = [];
		try
		{
			const query = "'me' in owners and properties has { key='MAESTRO_IMPORT' and value='1' } and trashed = true";
			const result = Drive.Files.list({
				q: query,
				corpora: 'user',
				fields: 'files(id, name, createdTime, properties)'
			});

			if (result && result.files)
			{
				result.files.forEach((file: any) =>
				{
					const fileName = file.name || 'Fichier sans nom';
					const introspection = ImportManager.introspectFile(file.id, fileName);

					items.push({
						fileId: file.id,
						fileName: fileName,
						detectedType: introspection.detectedType,
						createdTime: file.createdTime || '',
						availableActions: introspection.availableActions
					});
				});
			}
		}
		catch (e) {}

		return items;
	}

	static introspectFile(fileId: string, fileName: string): { detectedType: string; availableActions: Array<{ type: string; label: string }> }
	{
		for (const sniffer of ImportManager.sniffers)
		{
			try
			{
				const result = sniffer.sniff(fileId, fileName);
				if (result && result.availableActions && result.availableActions.length > 0)
				{
					return result;
				}
			}
			catch (e) {}
		}

		return {
			detectedType: 'Inconnu / Non reconnu',
			availableActions: []
		};
	}

	static executeImportAction(fileId: string, actionType: string, targetDbKey?: string)
	{
		if (actionType === 'IMPORT_ASSOCONNECT_STRUCTURES')
		{
			return AssoConnectImporter.importStructures(fileId);
		}
		else if (actionType === 'IMPORT_ASSOCONNECT_MEMBERS' || actionType === 'IMPORT_ASSOCONNECT_USERS')
		{
			return AssoConnectImporter.importUsers(fileId);
		}

		let targetDbId = '';
		const dbs = DbManager.listAccessibleDbs();
		if (targetDbKey)
		{
			const found = dbs.find(d => d.dbKey === targetDbKey.toLowerCase());
			if (found)
			{
				targetDbId = found.dbId;
			}
		}
		if (!targetDbId && dbs.length > 0)
		{
			targetDbId = dbs[0].dbId;
		}

		if (!targetDbId)
		{
			throw new Error('Aucune base de données cible trouvée pour effectuer l\'importation.');
		}

		const targetSs = SpreadsheetApp.openById(targetDbId);

		let sourceSheetName = actionType;
		if (actionType === 'IMPORT_ASSOCONNECT_STRUCTURES')
		{
			sourceSheetName = 'AssoConnect_Structures';
		}
		else if (actionType === 'IMPORT_ASSOCONNECT_MEMBERS')
		{
			sourceSheetName = 'AssoConnect_Members';
		}
		else if (actionType === 'IMPORT_COLLECTE_INSCRIPTIONS')
		{
			sourceSheetName = 'Collecte_Inscriptions';
		}
		else
		{
			sourceSheetName = 'Imported_Data';
		}

		let importedRowsCount = 0;
		try
		{
			const sourceSs = SpreadsheetApp.openById(fileId);
			const sourceSheet = sourceSs.getSheets()[0];
			const rows = sourceSheet.getDataRange().getValues();

			if (rows.length > 0)
			{
				let targetSheet = targetSs.getSheetByName(sourceSheetName);
				if (!targetSheet)
				{
					targetSheet = targetSs.insertSheet(sourceSheetName);
				}

				targetSheet.clear();
				rows.forEach(row =>
				{
					targetSheet.appendRow(row);
				});
				importedRowsCount = rows.length;
			}
		}
		catch (e: any)
		{
			throw new Error('Erreur lors de la lecture ou de l\'écriture des données: ' + e.message);
		}

		try
		{
			Drive.Files.remove(fileId);
		}
		catch (e) {}

		return {
			success: true,
			count: importedRowsCount,
			message: `Importation réussie (${importedRowsCount} lignes traitées et enregistrées).`
		};
	}

	static discardImportFile(fileId: string)
	{
		try
		{
			Drive.Files.remove(fileId);
			return { success: true };
		}
		catch (e: any)
		{
			throw new Error('Impossible de supprimer le fichier temporaire: ' + e.message);
		}
	}
}
