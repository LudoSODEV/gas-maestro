<template>
	<div class="card">
		<h2>Profils de structures</h2>
		<p class="description">Consultez et gérez les profils de structures, dossiers Google Drive associés et liens externes.</p>
		<div class="placeholder-content">
			<p>Module en cours de développement.</p>
		</div>
	</div>
</template>

<script>
export default {
	name: 'StructureProfiles'
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
.placeholder-content {
	padding: 40px;
	text-align: center;
	color: #5f6368;
	background: #f8f9fa;
	border-radius: 6px;
	border: 1px dashed #dadce0;
}
</style>
