<template>
	<div class="card">
		<h2>Gestion des bases de données</h2>
		<p class="description">Gérez vos connexions aux feuilles de calcul Google Sheets agissant comme bases de données régionales.</p>

		<div v-if="loading" class="loading">Chargement des bases de données...</div>

		<div v-else>
			<table>
				<thead>
					<tr>
						<th>Nom de la base (dbKey)</th>
						<th>Nom Google Drive</th>
						<th>Identifiant du fichier (Spreadsheet ID)</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(db, index) in dbs" :key="index">
						<td>
							<input v-model="db.dbKey" type="text" readonly style="background: #e9ecef;" />
						</td>
						<td>
							<input v-model="db.name" type="text" readonly style="background: #e9ecef;" />
						</td>
						<td>
							<input v-model="db.spreadsheetId" type="text" style="width: 250px;" />
						</td>
						<td>
							<div class="actions-cell">
								<a v-if="db.spreadsheetId && !db.spreadsheetId.startsWith('mock')" :href="'https://docs.google.com/spreadsheets/d/' + db.spreadsheetId" target="_blank" class="btn-link" title="Ouvrir le fichier">Ouvrir</a>
								
								<button v-if="dbs.length > 1 && db.dbKey !== activeDbKey" class="select-btn" @click="selectDb(db.dbKey)" title="Définir comme base active">Sélectionner</button>
								<span v-else-if="db.dbKey === activeDbKey" class="active-badge">Active</span>

								<button class="warning" @click="hideDb(index)" title="Cacher cette base de données de la liste">Cacher</button>
								<button class="danger" @click="openDeleteDialog(db)" title="Supprimer définitivement le fichier">Supprimer</button>
							</div>
						</td>
					</tr>
					<tr v-if="dbs.length === 0">
						<td colspan="4" style="text-align: center;">Aucune base de données configurée.</td>
					</tr>
				</tbody>
			</table>

			<div class="action-bar">
				<button class="primary" @click="searchAutoDb" style="background: #319795;" title="Rechercher une base de données existante sur Drive ou localement">🔍 Rechercher la base disponible</button>
				<button class="primary" @click="createAutoDb" style="background: #2b6cb0;" title="Créer une nouvelle base de données pour votre branche">➕ Créer une nouvelle base</button>
				<button class="primary" @click="saveDbs" style="background: #4a5568;">Enregistrer les modifications</button>
			</div>

			<p v-if="statusMessage" class="status-msg" :style="{ color: statusColor }">{{ statusMessage }}</p>
		</div>

		<!-- Delete Explanation Dialog / Modal -->
		<div v-if="showDeleteDialog" class="modal-overlay">
			<div class="modal-card">
				<h3>Suppression du document</h3>
				<p>
					Pour supprimer définitivement la base de données <strong>{{ dbToDelete?.dbKey }}</strong> ({{ dbToDelete?.name }}), vous pouvez :
				</p>
				<ol class="delete-instructions">
					<li>Ouvrir le fichier Google Sheets et le placer manuellement dans la corbeille de Google Drive.</li>
					<li>Ou utiliser le bouton ci-dessous pour placer automatiquement le fichier dans la corbeille via l'API Google Drive.</li>
				</ol>
				<div class="modal-actions">
					<a v-if="dbToDelete?.spreadsheetId && !dbToDelete?.spreadsheetId.startsWith('mock')" :href="'https://docs.google.com/spreadsheets/d/' + dbToDelete.spreadsheetId" target="_blank" class="btn-link">Ouvrir le fichier</a>
					<button class="danger" @click="confirmTrashDb">Mettre à la corbeille via l'API</button>
					<button class="secondary" @click="closeDeleteDialog">Annuler</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { IS_DEV, googleRun } from '../constants'

interface DatabaseItem {
	dbKey: string;
	name?: string;
	spreadsheetId: string;
}

export default {
	name: 'DatabaseManagement',
	setup()
	{
		const dbs = ref<DatabaseItem[]>([])
		const activeDbKey = ref('ba13')
		const loading = ref(true)
		const statusMessage = ref('')
		const statusColor = ref('green')

		const showDeleteDialog = ref(false)
		const dbToDelete = ref<DatabaseItem | null>(null)

		const loadDbs = () =>
		{
			loading.value = true
			if (!IS_DEV)
			{
				googleRun()
					?.withSuccessHandler((data: DatabaseItem[]) =>
					{
						dbs.value = data
						loading.value = false
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors du chargement: ' + err.message
						statusColor.value = 'red'
						loading.value = false
					})
					.Maestro_getUserDbs()

				googleRun()
					?.withSuccessHandler((activeKey: string) =>
					{
						if (activeKey)
						{
							activeDbKey.value = activeKey
						}
					})
					.withFailureHandler(() => {})
					.Maestro_getActiveDbKey()
			}
			else
			{
				// Local dev mock
				dbs.value = [
					{ dbKey: 'ba13', name: 'Maestro DB BA13', spreadsheetId: 'mock-spreadsheet-id-13' },
					{ dbKey: 'ba83', name: 'Maestro DB BA83', spreadsheetId: 'mock-spreadsheet-id-83' }
				]
				activeDbKey.value = 'ba13'
				loading.value = false
			}
		}

		const selectDb = (dbKey: string) =>
		{
			activeDbKey.value = dbKey
			window.dispatchEvent(new CustomEvent('db-activated', { detail: dbKey }))

			if (!IS_DEV)
			{
				googleRun()
					?.withSuccessHandler(() =>
					{
						statusMessage.value = `Base active définie sur : ${dbKey}`
						statusColor.value = 'green'
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors de la sélection de la base: ' + err.message
						statusColor.value = 'red'
					})
					.Maestro_setActiveDbKey(dbKey)
			}
			else
			{
				statusMessage.value = `Base active définie sur : ${dbKey} (Mode Local)`
				statusColor.value = 'green'
			}
		}

		const hideDb = (index: number) =>
		{
			dbs.value.splice(index, 1)
			statusMessage.value = 'Base cachée de la liste. Pensez à enregistrer les modifications.'
			statusColor.value = 'blue'
		}

		const openDeleteDialog = (db: DatabaseItem) =>
		{
			dbToDelete.value = db
			showDeleteDialog.value = true
		}

		const closeDeleteDialog = () =>
		{
			showDeleteDialog.value = false
			dbToDelete.value = null
		}

		const confirmTrashDb = () =>
		{
			if (!dbToDelete.value)
			{
				return
			}

			const target = dbToDelete.value
			closeDeleteDialog()

			statusMessage.value = 'Placement du fichier à la corbeille en cours...'
			statusColor.value = 'blue'

			if (!IS_DEV)
			{
				googleRun()
					?.withSuccessHandler(() =>
					{
						dbs.value = dbs.value.filter(d => d.spreadsheetId !== target.spreadsheetId && d.dbKey !== target.dbKey)
						statusMessage.value = `Base ${target.dbKey} placée à la corbeille et supprimée de la liste.`
						statusColor.value = 'green'
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors de la suppression: ' + err.message
						statusColor.value = 'red'
					})
					.Maestro_trashDb(target.spreadsheetId, target.dbKey)
			}
			else
			{
				setTimeout(() =>
				{
					dbs.value = dbs.value.filter(d => d.spreadsheetId !== target.spreadsheetId && d.dbKey !== target.dbKey)
					statusMessage.value = `Base ${target.dbKey} placée à la corbeille et supprimée de la liste. (Mode Local)`
					statusColor.value = 'green'
				}, 500)
			}
		}

		const saveDbs = () =>
		{
			statusMessage.value = 'Enregistrement en cours...'
			statusColor.value = 'blue'
			if (!IS_DEV)
			{
				googleRun()
					?.withSuccessHandler(() =>
					{
						statusMessage.value = 'Modifications enregistrées avec succès !'
						statusColor.value = 'green'
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors de l\'enregistrement: ' + err.message
						statusColor.value = 'red'
					})
					.Maestro_saveUserDbs(dbs.value)
			}
			else
			{
				setTimeout(() =>
				{
					statusMessage.value = 'Modifications enregistrées avec succès ! (Mode Local)'
					statusColor.value = 'green'
				}, 500)
			}
		}

		const searchAutoDb = () =>
		{
			statusMessage.value = 'Recherche de la base de données disponible en cours...'
			statusColor.value = 'blue'

			if (!IS_DEV)
			{
				googleRun()
					?.withSuccessHandler((foundDb: DatabaseItem | null) =>
					{
						if (foundDb)
						{
							if (!dbs.value.some((d: DatabaseItem) => d.dbKey === foundDb.dbKey))
							{
								dbs.value.push(foundDb)
							}
							statusMessage.value = `Base trouvée et synchronisée : ${foundDb.dbKey}`
							statusColor.value = 'green'
						}
						else
						{
							statusMessage.value = 'Aucune base de données existante trouvée sur Drive.'
							statusColor.value = 'orange'
						}
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors de la recherche: ' + err.message
						statusColor.value = 'red'
					})
					.Maestro_searchAutoDb()
			}
			else
			{
				setTimeout(() =>
				{
					const mockDb: DatabaseItem = { dbKey: 'ba13', name: 'Maestro DB BA13', spreadsheetId: 'mock-auto-id' }
					if (!dbs.value.some((d: DatabaseItem) => d.dbKey === mockDb.dbKey))
					{
						dbs.value.push(mockDb)
					}
					statusMessage.value = 'Base de données trouvée et synchronisée ! (Mode Local)'
					statusColor.value = 'green'
				}, 500)
			}
		}

		const createAutoDb = () =>
		{
			statusMessage.value = 'Création d\'une nouvelle base de données en cours...'
			statusColor.value = 'blue'

			if (!IS_DEV)
			{
				googleRun()
					?.withSuccessHandler((newDb: DatabaseItem) =>
					{
						if (!dbs.value.some((d: DatabaseItem) => d.dbKey === newDb.dbKey))
						{
							dbs.value.push(newDb)
						}
						statusMessage.value = `Nouvelle base créée et initialisée : ${newDb.dbKey}`
						statusColor.value = 'green'
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors de la création: ' + err.message
						statusColor.value = 'red'
					})
					.Maestro_createAutoDb()
			}
			else
			{
				setTimeout(() =>
				{
					const mockDb: DatabaseItem = { dbKey: 'ba13', name: 'Maestro DB BA13', spreadsheetId: 'mock-new-id' }
					if (!dbs.value.some((d: DatabaseItem) => d.dbKey === mockDb.dbKey))
					{
						dbs.value.push(mockDb)
					}
					statusMessage.value = 'Nouvelle base de données créée avec succès ! (Mode Local)'
					statusColor.value = 'green'
				}, 500)
			}
		}

		onMounted(() =>
		{
			loadDbs()
		})

		return {
			dbs,
			activeDbKey,
			loading,
			statusMessage,
			statusColor,
			showDeleteDialog,
			dbToDelete,
			selectDb,
			hideDb,
			openDeleteDialog,
			closeDeleteDialog,
			confirmTrashDb,
			saveDbs,
			searchAutoDb,
			createAutoDb
		}
	}
}
</script>

<style scoped>
.card {
	background: white;
	padding: 24px;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

h2 {
	margin-top: 0;
	color: #1a73e8;
	font-size: 20px;
}

.description {
	color: #5f6368;
	font-size: 14px;
	margin-bottom: 20px;
}

table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

th, td {
	border: 1px solid #e0e0e0;
	padding: 12px;
	text-align: left;
	font-size: 14px;
}

th {
	background-color: #f8f9fa;
	color: #3c4043;
}

input {
	padding: 8px 12px;
	border-radius: 4px;
	border: 1px solid #dadce0;
	font-size: 14px;
	width: 100%;
	box-sizing: border-box;
}

.actions-cell {
	display: flex;
	gap: 8px;
	align-items: center;
	flex-wrap: wrap;
}

.action-bar {
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	margin-top: 20px;
}

button, .btn-link {
	padding: 8px 16px;
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;
	text-decoration: none;
	display: inline-block;
	border: none;
}

button.primary {
	color: white;
	font-weight: 500;
}

button.danger {
	background: #d93025;
	color: white;
}

button.warning {
	background: #f2994a;
	color: white;
}

.select-btn {
	background: #34a853;
	color: white;
}

.active-badge {
	background: #e8f5e9;
	color: #2e7d32;
	padding: 6px 12px;
	border-radius: 4px;
	font-weight: 500;
	font-size: 13px;
}

.secondary {
	background: #f1f3f4;
	color: #3c4043;
}

.btn-link {
	background: #1a73e8;
	color: white;
}

.loading {
	color: #5f6368;
	font-style: italic;
}

.status-msg {
	margin-top: 16px;
	font-weight: 500;
	font-size: 14px;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-card {
	background: white;
	padding: 24px;
	border-radius: 8px;
	width: 500px;
	max-width: 90%;
	box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-card h3 {
	margin-top: 0;
	color: #d93025;
}

.delete-instructions {
	margin: 16px 0;
	padding-left: 20px;
	color: #3c4043;
	font-size: 14px;
	line-height: 1.5;
}

.delete-instructions li {
	margin-bottom: 8px;
}

.modal-actions {
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	margin-top: 20px;
}
</style>
