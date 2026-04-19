<script>
	import '../layout.css';
	let { children } = $props();
</script>

<div class="flex h-screen p-5 bg-white"> 
	{@render children()}
</div>
