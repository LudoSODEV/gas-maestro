import { DbManager } from './DbManager';

export interface StagedItem
{
	fileId: string;
	fileName: string;
	detectedType: string;
	availableActions: Array<{ type: string; label: string }>;
}

export class ImportManager
{
	static stageFiles(files: Array<{ name: string; mimeType: string; data: string }>): StagedItem[]
	{
		const results: StagedItem[] = [];

		if (!files || !Array.isArray(files))
		{
			return results;
		}

		files.forEach(f =>
		{
			const blob = Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType, f.name);
			let file: any;

			try
			{
				file = Drive.Files.create(
					{
						name: f.name,
						mimeType: 'application/vnd.google-apps.spreadsheet'
					},
					blob,
					{ supportsAllDrives: true }
				);
			}
			catch (err)
			{
				file = Drive.Files.create(
					{
						name: f.name
					},
					blob,
					{ supportsAllDrives: true }
				);
			}

			const fileId = file.id;

			const introspection = ImportManager.introspectFile(fileId, f.name);

			// Tag with MAESTRO_IMPORT property and trash in a single v3 update call
			Drive.Files.update(
				{
					trashed: true,
					properties: {
						MAESTRO_IMPORT: '1'
					}
				},
				fileId,
				undefined,
				{
					supportsAllDrives: true,
					fields: 'id, trashed, properties'
				}
			);

			results.push({
				fileId: fileId,
				fileName: f.name,
				detectedType: introspection.detectedType,
				availableActions: introspection.availableActions
			});
		});

		return results;
	}

	static listStagedImports(): StagedItem[]
	{
		const items: StagedItem[] = [];
		try
		{
			const query = "properties has { key='MAESTRO_IMPORT' } and trashed = true";
			const result = Drive.Files.list({
				q: query,
				fields: 'files(id, name, properties)',
				supportsAllDrives: true,
				includeItemsFromAllDrives: true
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
						availableActions: introspection.availableActions
					});
				});
			}
		}
		catch (e: any)
		{
			console.error('Erreur lors de la récupération des fichiers en attente:', e?.message || e);
		}

		return items;
	}

	static introspectFile(fileId: string, fileName: string): { detectedType: string; availableActions: Array<{ type: string; label: string }> }
	{
		const lowerName = fileName.toLowerCase();
		let detectedType = 'Inconnu / Non reconnu';
		let availableActions: Array<{ type: string; label: string }> = [];

		try
		{
			const ss = SpreadsheetApp.openById(fileId);
			const sheets = ss.getSheets();
			const sheetNames = sheets.map(s => s.getName());

			const hasExport1 = sheetNames.some(n => n.toLowerCase().includes('export 1') || n.toLowerCase().includes('assoconnect'));
			if (hasExport1 || lowerName.includes('assoconnect') || lowerName.includes('export'))
			{
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
					detectedType = 'AssoConnect (Structures)';
					availableActions.push({
						type: 'IMPORT_ASSOCONNECT_STRUCTURES',
						label: 'Import AssoConnect structures'
					});
				}
				else
				{
					detectedType = 'AssoConnect (Membres / Autre)';
					availableActions.push({
						type: 'IMPORT_ASSOCONNECT_MEMBERS',
						label: 'Import AssoConnect membres'
					});
				}
			}
			else if (lowerName.includes('collecte') || sheetNames.some(n => n.toLowerCase().includes('collecte') || n.toLowerCase().includes('inscription')))
			{
				detectedType = 'Application Collecte (Inscriptions)';
				availableActions.push({
					type: 'IMPORT_COLLECTE_INSCRIPTIONS',
					label: 'Import Collecte (Inscriptions)'
				});
			}
			else if (sheets.length > 0)
			{
				detectedType = 'Fichier Tableur Général';
				availableActions.push({
					type: 'IMPORT_GENERIC_SPREADSHEET',
					label: 'Importer dans la base active'
				});
			}
		}
		catch (e)
		{
			if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt'))
			{
				detectedType = 'Fichier Texte / CSV';
				availableActions.push({
					type: 'IMPORT_GENERIC_CSV',
					label: 'Importer fichier texte/CSV'
				});
			}
		}

		return { detectedType, availableActions };
	}

	static executeImportAction(fileId: string, actionType: string, targetDbKey?: string)
	{
		let targetSpreadsheetId = '';
		const dbs = DbManager.listAccessibleDbs();
		if (targetDbKey)
		{
			const found = dbs.find(d => d.dbKey === targetDbKey.toLowerCase());
			if (found)
			{
				targetSpreadsheetId = found.spreadsheetId;
			}
		}
		if (!targetSpreadsheetId && dbs.length > 0)
		{
			targetSpreadsheetId = dbs[0].spreadsheetId;
		}

		if (!targetSpreadsheetId)
		{
			throw new Error('Aucune base de données cible trouvée pour effectuer l\'importation.');
		}

		const targetSs = SpreadsheetApp.openById(targetSpreadsheetId);

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
			Drive.Files.delete(fileId, { supportsAllDrives: true });
		}
		catch (e: any)
		{
			console.warn(`Impossible de supprimer le fichier temporaire ${fileId}:`, e?.message || e);
		}

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
			Drive.Files.delete(fileId, { supportsAllDrives: true });
			return { success: true };
		}
		catch (e: any)
		{
			throw new Error('Impossible de supprimer le fichier temporaire: ' + e.message);
		}
	}
}