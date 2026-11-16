<template>
	<div class="app-container">
		<header class="app-header">
			<div class="header-titles">
				<h1>Maestro - Centre de Contrôle</h1>
				<p class="subtitle">Banque Alimentaire - Application de gestion et synchronisation</p>
			</div>
			<div class="header-indicators">
				<div class="indicator-item">
					<span>Utilisateur connecté:</span>
					<strong>{{ currentUserEmail }}</strong>
				</div>
				<div class="indicator-item">
					<span>Base de données active:</span>
					<strong>{{ activeDatabaseIndicator }}</strong>
				</div>
			</div>
		</header>

		<div class="main-layout">
			<nav class="sidebar">
				<div v-for="section in sections" :key="section.id" class="nav-section">
					<h3 class="section-title">{{ section.name }}</h3>
					<ul class="tool-list">
						<li v-for="tool in section.tools" :key="tool.id">
							<a
								:href="getToolUrl(section.id, tool.id)"
								@click.prevent="selectTool(section.id, tool.id)"
								:class="{ active: currentSection === section.id && currentTool === tool.id }"
							>
								{{ tool.name }}
							</a>
						</li>
					</ul>
				</div>
			</nav>

			<main class="content-area">
				<component :is="currentToolComponent" />
			</main>
		</div>
	</div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DatabaseManagement from './components/DatabaseManagement.vue'
import StructureProfiles from './components/StructureProfiles.vue'
import AssoConnect from './components/AssoConnect.vue'
import Administration from './components/Administration.vue'

export default {
	name: 'App',
	setup()
	{
		const currentUserEmail = ref('Chargement...')
		const activeDatabaseIndicator = ref('Aucune')

		const sections = [
			{
				id: 'main',
				name: 'Menu principal',
				tools: [
					{ id: 'gestion-dbs', name: 'Gestion des bases de données' },
					{ id: 'profils-structures', name: 'Profils de structures' },
					{ id: 'assoconnect', name: 'AssoConnect' },
					{ id: 'administration', name: 'Administration' }
				]
			}
		]

		const currentSection = ref('main')
		const currentTool = ref('gestion-dbs')

		const toolComponentMap = {
			'gestion-dbs': DatabaseManagement,
			'profils-structures': StructureProfiles,
			'assoconnect': AssoConnect,
			'administration': Administration
		}

		const currentToolComponent = computed(() =>
		{
			return toolComponentMap[currentTool.value] || DatabaseManagement
		})

		const loadUserEmail = () =>
		{
			if (window.google?.script?.run)
			{
				google.script.run
					.withSuccessHandler(email =>
					{
						currentUserEmail.value = email
					})
					.withFailureHandler(() =>
					{
						currentUserEmail.value = 'Utilisateur inconnu'
					})
					.Maestro_getCurrentUserEmail()
			}
			else
			{
				currentUserEmail.value = 'dev@local.host'
			}
		}

		const applyState = (secId, toolId) =>
		{
			if (toolComponentMap[toolId])
			{
				currentSection.value = secId
				currentTool.value = toolId
			}
		}

		const getToolUrl = (secId, toolId) =>
		{
			const baseUrl = window.DEPLOYMENT_URL || ''
			return `${baseUrl}?section=${secId}&tool=${toolId}`
		}

		const updateHistory = (secId, toolId, isReplace = false) =>
		{
			const stateObject = { section: secId, tool: toolId }
			const queryParams = { section: secId, tool: toolId }

			if (window.google?.script?.history)
			{
				if (isReplace)
				{
					google.script.history.replace(stateObject, queryParams, '')
				}
				else
				{
					google.script.history.push(stateObject, queryParams, '')
				}
			}
			else
			{
				// Fallback for local development
				const url = new URL(window.location.href)
				url.searchParams.set('section', secId)
				url.searchParams.set('tool', toolId)
				url.hash = ''
				if (isReplace)
				{
					window.history.replaceState(stateObject, '', url.toString())
				}
				else
				{
					window.history.pushState(stateObject, '', url.toString())
				}
			}
		}

		const selectTool = (secId, toolId) =>
		{
			applyState(secId, toolId)
			updateHistory(secId, toolId, false)
		}

		const handlePopState = (e) =>
		{
			if (e && e.state && e.state.section && e.state.tool)
			{
				applyState(e.state.section, e.state.tool)
			}
			else
			{
				const params = new URLSearchParams(window.location.search)
				const sec = params.get('section') || 'main'
				const tool = params.get('tool') || 'gestion-dbs'
				if (toolComponentMap[tool])
				{
					applyState(sec, tool)
				}
			}
		}

		onMounted(() =>
		{
			loadUserEmail()

			// 1. Check initial params injected from server (window.INITIAL_PARAMS)
			const initialParams = window.INITIAL_PARAMS || {}
			const initSec = initialParams.section || 'main'
			const initTool = initialParams.tool

			if (initTool && toolComponentMap[initTool])
			{
				applyState(initSec, initTool)
				updateHistory(initSec, initTool, true)
			}
			else
			{
				// 2. Check browser query parameters
				const params = new URLSearchParams(window.location.search)
				const qSec = params.get('section') || 'main'
				const qTool = params.get('tool')

				if (qTool && toolComponentMap[qTool])
				{
					applyState(qSec, qTool)
					updateHistory(qSec, qTool, true)
				}
				else
				{
					updateHistory(currentSection.value, currentTool.value, true)
				}
			}

			if (window.google?.script?.history)
			{
				google.script.history.setChangeHandler((e) =>
				{
					const params = e.location?.parameters || {}
					const sec = params.section || 'main'
					const tool = params.tool || 'gestion-dbs'
					if (toolComponentMap[tool])
					{
						applyState(sec, tool)
					}
				})
			}
			else
			{
				window.addEventListener('popstate', handlePopState)
			}
		})

		onUnmounted(() =>
		{
			if (!window.google?.script?.history)
			{
				window.removeEventListener('popstate', handlePopState)
			}
		})

		return {
			currentUserEmail,
			activeDatabaseIndicator,
			sections,
			currentSection,
			currentTool,
			currentToolComponent,
			getToolUrl,
			selectTool
		}
	}
}
</script>

<style>
body {
	margin: 0;
	background: #f5f7fa;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	color: #333;
}

.app-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}

.app-header {
	background: white;
	padding: 20px 24px;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	margin-bottom: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;
}

.header-titles h1 {
	margin: 0 0 4px 0;
	color: #1a73e8;
	font-size: 24px;
}

.subtitle {
	margin: 0;
	color: #5f6368;
	font-size: 14px;
}

.header-indicators {
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 13px;
	color: #3c4043;
	background: #f8f9fa;
	padding: 10px 14px;
	border-radius: 6px;
	border: 1px solid #e0e0e0;
}

.indicator-item {
	display: flex;
	gap: 8px;
}

.main-layout {
	display: flex;
	gap: 24px;
}

.sidebar {
	width: 260px;
	background: white;
	padding: 16px;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	flex-shrink: 0;
}

.nav-section {
	margin-bottom: 20px;
}

.section-title {
	font-size: 13px;
	text-transform: uppercase;
	color: #5f6368;
	margin: 0 0 8px 8px;
	letter-spacing: 0.5px;
}

.tool-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.tool-list li {
	margin-bottom: 4px;
}

.tool-list a {
	display: block;
	padding: 10px 12px;
	color: #3c4043;
	text-decoration: none;
	border-radius: 4px;
	font-size: 14px;
	transition: background 0.2s, color 0.2s;
}

.tool-list a:hover {
	background: #f1f3f4;
	color: #1a73e8;
}

.tool-list a.active {
	background: #e8f0fe;
	color: #1a73e8;
	font-weight: 500;
}

.content-area {
	flex-grow: 1;
}

@media (max-width: 768px) {
	.main-layout {
		flex-direction: column;
	}
	.sidebar {
		width: 100%;
	}
	.app-header {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
