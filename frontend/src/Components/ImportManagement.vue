<template>
	<div class="card">
		<h2>Gestion des Importations</h2>
		<p class="description">Importez vos fichiers (AssoConnect, Application Collecte, VIF, AMS ou CSV) de manière intelligente et instantanée.</p>

		<!-- Stage 1: Dropzone & File Picker -->
		<div class="dropzone" 
			 @dragover.prevent="isDragging = true" 
			 @dragleave.prevent="isDragging = false" 
			 @drop.prevent="handleDrop"
			 :class="{ 'dragging': isDragging }">
			<div class="dropzone-content">
				<svg class="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
				</svg>
				<p class="text-sm font-medium text-slate-700 mb-1">
					Glissez-déposez vos fichiers ici (XLSX, CSV, TXT)
				</p>
				<p class="text-xs text-slate-500 mb-4">
					ou sélectionnez-les depuis votre ordinateur
				</p>
				<label class="btn-primary cursor-pointer inline-block">
					<span>Sélectionner des fichiers</span>
					<input type="file" multiple accept=".xlsx,.xls,.csv,.txt" class="hidden" @change="handleFileSelect" />
				</label>
			</div>
		</div>

		<!-- Upload / Staging Status Message -->
		<div v-if="statusMessage" class="status-msg" :style="{ color: statusColor }">
			{{ statusMessage }}
		</div>

		<!-- Stage 2: Staging Table -->
		<div class="mt-8">
			<h3 class="text-base font-semibold text-slate-800 mb-4">
				Fichiers en attente dans le bac à sable (Staging)
			</h3>

			<div v-if="loading" class="loading">Chargement des fichiers en attente...</div>

			<div v-else-if="stagedItems.length === 0" class="empty-state">
				Aucun fichier en attente d'importation. Sélectionnez ou déposez un fichier ci-dessus.
			</div>

			<div v-else class="overflow-x-auto">
				<table>
					<thead>
						<tr>
							<th>Date de création</th>
							<th>Fichier</th>
							<th>Type Détecté</th>
							<th>Actions Disponibles</th>
							<th>Contrôles</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in stagedItems" :key="item.fileId">
							<td class="text-sm text-slate-500 whitespace-nowrap">
								{{ formatDate(item.createdTime) }}
							</td>
							<td class="font-medium text-slate-900">
								{{ item.fileName }}
							</td>
							<td>
								<span class="type-badge">{{ item.detectedType }}</span>
							</td>
							<td>
								<div class="flex flex-col gap-2">
									<button v-for="action in item.availableActions" 
											:key="action.type"
											@click="executeAction(item.fileId, action.type)"
											class="action-btn-primary"
											:disabled="isExecuting[item.fileId]">
										{{ isExecuting[item.fileId] ? 'Traitement...' : '• ' + action.label }}
									</button>
									<span v-if="!item.availableActions || item.availableActions.length === 0" class="text-slate-400 text-xs italic">
										Aucune action disponible
									</span>
								</div>
							</td>
							<td>
								<div class="flex items-center gap-2">
									<button @click="discardFile(item.fileId)" 
											class="btn-danger"
											title="Supprimer définitivement du bac à sable Google Drive">
										Supprimer
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { googleRun } from '../constants'

interface StagedItem {
	fileId: string;
	fileName: string;
	detectedType: string;
	createdTime?: string;
	availableActions: Array<{ type: string; label: string }>;
}

export default {
	name: 'ImportManagement',
	setup()
	{
		const stagedItems = ref<StagedItem[]>([])
		const loading = ref(true)
		const isDragging = ref(false)
		const statusMessage = ref('')
		const statusColor = ref('green')
		const isExecuting = ref<Record<string, boolean>>({})

		const formatDate = (isoStr?: string) =>
		{
			if (!isoStr)
			{
				return '-'
			}
			try
			{
				return new Date(isoStr).toLocaleString('fr-FR', {
					dateStyle: 'short',
					timeStyle: 'medium'
				})
			}
			catch (e)
			{
				return isoStr
			}
		}

		const loadStagedImports = () =>
		{
			loading.value = true
			googleRun()
				.withSuccessHandler((items: StagedItem[]) =>
				{
					stagedItems.value = items || []
					loading.value = false
				})
				.withFailureHandler((err: any) =>
				{
					statusMessage.value = 'Erreur lors du chargement des fichiers: ' + err.message
					statusColor.value = 'red'
					loading.value = false
				})
				.Maestro_listStagedImports()
		}

		const processFiles = (filesList: FileList | File[]) =>
		{
			statusMessage.value = 'Téléversement instantané et mise en bac à sable (Google Drive)...'
			statusColor.value = 'blue'

			const filePromises: Promise<any>[] = []

			Array.from(filesList).forEach((file: File) =>
			{
				const promise = new Promise((resolve) =>
				{
					const reader = new FileReader()
					reader.onload = (e: any) =>
					{
						const base64String = e.target.result.split(',')[1]
						resolve({
							name: file.name,
							mimeType: file.type || 'application/octet-stream',
							data: base64String
						})
					}
					reader.readAsDataURL(file)
				})
				filePromises.push(promise)
			})

			Promise.all(filePromises).then((payloads) =>
			{
				googleRun()
					.withSuccessHandler((newItems: StagedItem[]) =>
					{
						if (Array.isArray(newItems))
						{
							stagedItems.value = [...stagedItems.value, ...newItems]
						}
						statusMessage.value = 'Fichiers téléversés, analysés et prêts pour l\'importation.'
						statusColor.value = 'green'
					})
					.withFailureHandler((err: any) =>
					{
						statusMessage.value = 'Erreur lors du téléversement: ' + err.message
						statusColor.value = 'red'
					})
					.Maestro_stageImportFiles(payloads)
			})
		}

		const handleFileSelect = (e: any) =>
		{
			if (e.target.files && e.target.files.length > 0)
			{
				processFiles(e.target.files)
			}
		}

		const handleDrop = (e: any) =>
		{
			isDragging.value = false
			if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0)
			{
				processFiles(e.dataTransfer.files)
			}
		}

		const executeAction = (fileId: string, actionType: string) =>
		{
			isExecuting.value[fileId] = true
			statusMessage.value = 'Exécution de l\'importation et nettoyage du fichier temporaire...'
			statusColor.value = 'blue'

			googleRun()
				.withSuccessHandler((res: any) =>
				{
					isExecuting.value[fileId] = false
					stagedItems.value = stagedItems.value.filter(i => i.fileId !== fileId)
					statusMessage.value = res.message || 'Importation effectuée avec succès !'
					statusColor.value = 'green'
				})
				.withFailureHandler((err: any) =>
				{
					isExecuting.value[fileId] = false
					statusMessage.value = 'Erreur lors de l\'importation: ' + err.message
					statusColor.value = 'red'
				})
				.Maestro_executeImportAction(fileId, actionType)
		}

		const discardFile = (fileId: string) =>
		{
			statusMessage.value = 'Suppression du fichier temporaire...'
			statusColor.value = 'blue'

			googleRun()
				.withSuccessHandler(() =>
				{
					stagedItems.value = stagedItems.value.filter(i => i.fileId !== fileId)
					statusMessage.value = 'Fichier temporaire supprimé définitivement du bac à sable.'
					statusColor.value = 'green'
				})
				.withFailureHandler((err: any) =>
				{
					statusMessage.value = 'Erreur lors de la suppression: ' + err.message
					statusColor.value = 'red'
				})
				.Maestro_discardImportFile(fileId)
		}

		onMounted(() =>
		{
			loadStagedImports()
		})

		return {
			stagedItems,
			loading,
			isDragging,
			statusMessage,
			statusColor,
			isExecuting,
			formatDate,
			handleFileSelect,
			handleDrop,
			executeAction,
			discardFile
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

.dropzone {
	border: 2px dashed #dadce0;
	border-radius: 8px;
	padding: 32px;
	text-align: center;
	background: #f8f9fa;
	transition: all 0.2s ease;
}

.dropzone.dragging {
	border-color: #1a73e8;
	background: #e8f0fe;
}

.btn-primary {
	background: #1a73e8;
	color: white;
	padding: 8px 16px;
	border-radius: 4px;
	font-size: 14px;
	font-weight: 500;
	display: inline-block;
}

.btn-primary:hover {
	background: #1557b0;
}

.action-btn-primary {
	background: #1a73e8;
	color: white;
	padding: 6px 12px;
	border-radius: 4px;
	font-size: 13px;
	font-weight: 500;
	border: none;
	cursor: pointer;
	text-align: left;
	transition: background 0.2s;
}

.action-btn-primary:hover {
	background: #1557b0;
}

.btn-danger {
	background: #d93025;
	color: white;
	padding: 6px 12px;
	border-radius: 4px;
	font-size: 13px;
	font-weight: 500;
	border: none;
	cursor: pointer;
}

.btn-danger:hover {
	background: #b31412;
}

table {
	width: 100%;
	border-collapse: collapse;
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

.type-badge {
	background: #e8f0fe;
	color: #1a73e8;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 13px;
	font-weight: 500;
}

.empty-state {
	text-align: center;
	padding: 32px;
	color: #5f6368;
	background: #f8f9fa;
	border-radius: 8px;
	font-style: italic;
}

.loading {
	color: #5f6368;
	font-style: italic;
	text-align: center;
	padding: 16px;
}

.status-msg {
	margin-top: 16px;
	font-weight: 500;
	font-size: 14px;
}
</style>
