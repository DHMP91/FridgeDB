<script>
	import './layout.css';
	import { BottomNav, BottomNavItem } from "flowbite-svelte";
	import { HomeSolid, WalletSolid } from "flowbite-svelte-icons";
	let { children } = $props();

</script>

<div class="flex h-screen p-5 bg-white"> 
	{@render children()}

	<BottomNav position="absolute" classes={{ inner: "grid-cols-2" }}>
		<BottomNavItem btnName="Inventory">
			<HomeSolid class="group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
		</BottomNavItem>
		<BottomNavItem btnName="Grocery List">
			<WalletSolid class="group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
		</BottomNavItem>
	</BottomNav>
</div>
