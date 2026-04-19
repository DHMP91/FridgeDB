<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../auth/$types';
  	import { Modal, Label, Input, Button } from "flowbite-svelte";
	let { form }: { form: ActionData } = $props();
	let loginModal = $state(true)
</script>

<main class="flex-1 w-full">
	<Modal title="Login" bind:open={loginModal} class="max-w-1/4" permanent>
		<div>
			<form method="post" action="?/signInEmail">
			    <div class="mb-6">
					<Label for="email" class="mb-2 block">
						Email
						<Input type="email" name="email" placeholder="EEEEEMMMMAAAAILLL"/>
					</Label>
					
				</div>

				<div class="mb-6">
					<Label for="password" class="mb-2 block">
						Password
						<Input type="password" name="password" placeholder="PAWWWWSSSSWWWEEEERRRD"/>
					</Label>
				</div>
				<Button type="submit">
					Login
				</Button>
			</form>
		<!-- <form method="post" action="?/signUpEmail" use:enhance>
			<label>
				Name
				<input
					type="name"
					name="name"
					class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</label>
			<label>
				Email
				<input
					type="email"
					name="email"
					class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</label>
			<label>
				Password
				<input
					type="password"
					name="password"
					class="mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</label>
			<button class="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
				Signup
			</button>
		</form> -->
		<p class="text-red-500">{form?.message ?? ''}</p>
		</div>
	</Modal>
</main>
