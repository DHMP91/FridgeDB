<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
  	let { data, form } = $props<{ data: PageData; form?: ActionData }>();
</script>

<main class="flex-1 w-full">
	<header class="h-8 flex items-center bg-white">
		<h1>Hi, {data.user.name}!</h1>
	</header>


	<div class="max-w-100 mt-5 mb-5">
		<form method="post" action="?/signOut" use:enhance>
			<button class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">Sign out</button>
		</form>
	</div>


	{#if form?.apiKey}
		<div class="max-w-100 mt-5 mb-5">
			<p>Your new API Key: {data.user.id}.</p>
		</div>
	{:else}
		<form method="post" action="?/newAPIKey" use:enhance>
			<button class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">Create API Key</button>
		</form>
	{/if}
</main>
