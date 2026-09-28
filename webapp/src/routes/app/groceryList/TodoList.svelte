<script>
	import { send, receive } from './transition.js';
	let { todos, update, remove } = $props();
</script>

<ul class="todos">
	{#each todos as todo (todo.id)}
		<li
			class={{ done: todo.done }}
			in:receive={{ key: todo.id }}
			out:send={{ key: todo.id }}
		>
			<label>
				<!-- <input class="mx-2" type="checkbox" bind:checked={todo.done} onclick={}/> -->
                 <input class="mx-2" type="checkbox" onclick={()=> { update(todo) }}/>
				<span>{todo.description}</span>
				<button onclick={() => remove(todo)} aria-label="Remove">Remove</button>
			</label>
		</li>
	{/each}
</ul>

<style>
	label {
		width: 100%;
		height: 100%;
		display: flex;
	}

	span {
		flex: 1;
	}
</style>
