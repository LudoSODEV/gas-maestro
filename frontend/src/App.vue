<template>
	<div v-cloak class="min-h-screen flex flex-col md:flex-row">

		<!-- MOBILE DRAWER BACKDROP -->
		<transition name="fade">
			<div v-if="isMobileMenuOpen" 
				 @click="isMobileMenuOpen = false"
				 class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden">
			</div>
		</transition>

		<!-- SIDEBAR NAVIGATION -->
		<aside :class="[
				   'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:shrink-0',
				   isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
			   ]">
			<!-- Brand Logo Area -->
			<div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
				<div class="flex items-center gap-3">
					<div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
						M
					</div>
					<div>
						<span class="text-white font-bold text-lg tracking-tight block leading-none">Maestro</span>
						<span class="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Maestro</span>
					</div>
				</div>
				<button @click="isMobileMenuOpen = false" 
						class="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
						aria-label="Fermer le menu">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<!-- Navigation Links -->
			<div class="flex-1 px-4 py-6 overflow-y-auto space-y-6">
				<div>
					<p class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
						Menu principal
					</p>
					<nav class="space-y-1.5">
						<button v-for="item in navItems" 
								:key="item.id"
								@click="selectRoute(item.id)"
								:class="[
									'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left',
									currentTool === item.id 
										? 'bg-blue-600 text-white shadow-md shadow-blue-950/50' 
										: 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
								]">
							<!-- Databases Icon -->
							<svg v-if="item.id === 'gestion-dbs'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
							</svg>
							<!-- Structures Icon -->
							<svg v-if="item.id === 'profils-structures'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
							</svg>
							<!-- AssoConnect Icon -->
							<svg v-if="item.id === 'assoconnect'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<!-- Administration Icon -->
							<svg v-if="item.id === 'administration'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
							<span class="truncate">{{ item.label }}</span>
						</button>
					</nav>
				</div>
			</div>

			<!-- Sidebar Footer -->
			<div class="p-4 border-t border-slate-800 bg-slate-950/30 text-xs text-slate-400">
				<div class="flex items-center justify-between">
					<span>Apps Script GAS</span>
					<span class="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
						<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
						Connecté
					</span>
				</div>
			</div>
		</aside>

		<!-- MAIN CONTENT WRAPPER -->
		<div class="flex-1 flex flex-col min-w-0">
			<!-- TOP NAVBAR -->
			<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
				<div class="flex items-center gap-4">
					<button @click="isMobileMenuOpen = true" 
							class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
							aria-label="Ouvrir le menu">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
						</svg>
					</button>
					<h1 class="text-lg font-bold text-slate-900 tracking-tight">
						{{ currentRouteTitle }}
					</h1>
				</div>

				<!-- Global Persistent Header Indicators -->
				<div class="flex items-center gap-4 text-sm">
					<!-- Active User Indicator -->
					<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
						<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
						</svg>
						<span class="truncate max-w-[200px]">{{ currentUserEmail }}</span>
					</div>

					<!-- Active Database Indicator with Quick Management Link -->
					<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-medium border border-blue-200">
						<svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
						</svg>
						<span class="truncate">Base: <strong class="font-semibold">{{ activeDbKey }}</strong></span>
						<button @click="selectRoute('gestion-dbs')" 
								title="Gérer les bases de données"
								class="p-1 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-900 transition-colors ml-1 focus:outline-none">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
						</button>
					</div>
				</div>
			</header>

			<!-- VIEWPORT CONTENT -->
			<main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
				<component :is="currentToolComponent" />
			</main>
		</div>

	</div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DatabaseManagement from './Components/DatabaseManagement.vue'
import StructureProfiles from './Components/StructureProfiles.vue'
import AssoConnect from './Components/AssoConnect.vue'
import Administration from './Components/Administration.vue'

export default {
	name: 'App',
	setup()
	{
		const currentUserEmail = ref('Chargement...')
		const activeDbKey = ref('ba13')
		const isMobileMenuOpen = ref(false)

		const navItems = [
			{ id: 'gestion-dbs', label: 'Gestion des bases de données' },
			{ id: 'profils-structures', label: 'Profils de structures' },
			{ id: 'assoconnect', label: 'AssoConnect' },
			{ id: 'administration', label: 'Administration' }
		]

		const currentTool = ref('gestion-dbs')

		const toolComponentMap: Record<string, any> = {
			'gestion-dbs': DatabaseManagement,
			'profils-structures': StructureProfiles,
			'assoconnect': AssoConnect,
			'administration': Administration
		}

		const currentToolComponent = computed(() =>
		{
			return toolComponentMap[currentTool.value] || DatabaseManagement
		})

		const currentRouteTitle = computed(() =>
		{
			const found = navItems.find(i => i.id === currentTool.value)
			return found ? found.label : 'Maestro'
		})

		const loadUserData = () =>
		{
			if (window.google?.script?.run)
			{
				window.google.script.run
					.withSuccessHandler((email: string) =>
					{
						currentUserEmail.value = email
					})
					.withFailureHandler(() =>
					{
						currentUserEmail.value = 'Utilisateur inconnu'
					})
					.Maestro_getCurrentUserEmail()

				window.google.script.run
					.withSuccessHandler((dbs: any) =>
					{
						if (Array.isArray(dbs) && dbs.length > 0)
						{
							activeDbKey.value = dbs[0].dbKey || 'ba13'
						}
					})
					.withFailureHandler(() => {})
					.Maestro_getUserDbs()

				window.google.script.run
					.withSuccessHandler((activeKey: string) =>
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
				currentUserEmail.value = 'dev@local.host'
				activeDbKey.value = 'ba13'
			}
		}

		const applyState = (toolId: string) =>
		{
			if (toolComponentMap[toolId])
			{
				currentTool.value = toolId
			}
		}

		const updateHistory = (toolId: string, isReplace: boolean = false) =>
		{
			const stateObject = { tool: toolId }
			const queryParams = { tool: toolId }

			if (window.google?.script?.history)
			{
				if (isReplace)
				{
					window.google.script.history.replace(stateObject, queryParams, '')
				}
				else
				{
					window.google.script.history.push(stateObject, queryParams, '')
				}
			}
			else
			{
				const url = new URL(window.location.href)
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

		const selectRoute = (toolId: string) =>
		{
			applyState(toolId)
			updateHistory(toolId, false)
			isMobileMenuOpen.value = false
		}

		const handlePopState = (e: any) =>
		{
			if (e && e.state && e.state.tool)
			{
				applyState(e.state.tool)
			}
			else
			{
				const params = new URLSearchParams(window.location.search)
				const tool = params.get('tool') || 'gestion-dbs'
				if (toolComponentMap[tool])
				{
					applyState(tool)
				}
			}
		}

		const handleDbActivated = (e: any) =>
		{
			if (e.detail)
			{
				activeDbKey.value = e.detail
			}
		}

		onMounted(() =>
		{
			loadUserData()
			window.addEventListener('db-activated', handleDbActivated)

			const initialParams = window.INITIAL_PARAMS || {}
			const initTool = initialParams.tool

			if (initTool && toolComponentMap[initTool])
			{
				applyState(initTool)
				updateHistory(initTool, true)
			}
			else
			{
				const params = new URLSearchParams(window.location.search)
				const qTool = params.get('tool')

				if (qTool && toolComponentMap[qTool])
				{
					applyState(qTool)
					updateHistory(qTool, true)
				}
				else
				{
					updateHistory(currentTool.value, true)
				}
			}

			if (window.google?.script?.history)
			{
				window.google.script.history.setChangeHandler((e: any) =>
				{
					const params = e.location?.parameters || {}
					const tool = params.tool || 'gestion-dbs'
					if (toolComponentMap[tool])
					{
						applyState(tool)
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
			window.removeEventListener('db-activated', handleDbActivated)
			if (!window.google?.script?.history)
			{
				window.removeEventListener('popstate', handlePopState)
			}
		})

		return {
			currentUserEmail,
			activeDbKey,
			isMobileMenuOpen,
			navItems,
			currentTool,
			currentToolComponent,
			currentRouteTitle,
			selectRoute
		}
	}
}
</script>

<style>
[v-cloak] {
	display: none;
}
.fade-enter-active, .fade-leave-active {
	transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
	opacity: 0;
}
</style>
