<script lang="ts">
	import TodoList from './TodoList.svelte';
  import { Input } from "flowbite-svelte"; // Generic
  type toBuyType = { 
  id?: number;
  done: boolean;
  description: string;
}; 

	const todos: toBuyType[] = $state([
		{ id: 1, done: false, description: 'write some docs', order: 3000 },
		{ id: 2, done: false, description: 'start writing blog post', order: 2000 },
		{ id: 3, done: true, description: 'buy some milk', order: 1000 },
		{ id: 4, done: false, description: 'mow the lawn', order: 4000 },
		{ id: 5, done: false, description: 'feed the turtle', order: 5000 },
		{ id: 6, done: false, description: 'fix some bugs', order: 6000 }
	]);

  
  const { maxOrder, maxOrderDone } = $derived.by(() => {
    const tobuys = todos.filter((t) => !t.done);
    const dones = todos.filter((t) => t.done);

    return {
      maxOrder: tobuys.reduce((max, todo) => Math.max(max, todo.order), 0),
      maxOrderDone: dones.reduce((max, todo) => Math.max(max, todo.order), 0)
    };
  });

	let uid = todos.length + 1;

	function remove(todo: toBuyType) {
		const index = todos.indexOf(todo);
		todos.splice(index, 1);
	}

  function update(todo: toBuyType) {
    // REFACTOR TO LINKEDLIST
    console.log(maxOrder)
    console.log(maxOrderDone)

    const newOrder = !todo.done ? maxOrderDone + 1: maxOrder + 1
    const newDone = !todo.done
    console.log(newOrder)
    console.log(newDone)

    todo.done = newDone
    todo.order = newOrder
  }
</script>

<main class="flex-1 w-full">

  <div class="max-w-100 mt-5 mb-5">
     <Input
        placeholder="Write here to add to buy list"
        onkeydown={(e) => {
          if (e.key !== 'Enter') return;

          todos.push({
            id: uid++,
            done: false,
            description: e.currentTarget.value,
            order: maxOrder + 1
          });

          e.currentTarget.value = '';
        }}
        />
  </div>

  <div class="max-w-100 mt-5 mb-5">
      <div class="todo">
        <h2>To Buy</h2>
        <TodoList todos={todos.filter((t) => !t.done).sort((a, b) => a.order - b.order)} {update} {remove} />
      </div>

      <div class="done">
        <h2>History</h2>
        <TodoList todos={todos.filter((t) => t.done).sort((a, b) => a.order - b.order)} {update} {remove} />
      </div>
  </div>

  </main>
