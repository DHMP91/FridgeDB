<script lang="ts">
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from "flowbite-svelte";
  import { ButtonGroup , Button, Modal } from "flowbite-svelte";
  import { slide } from "svelte/transition";
  import { type ItemType } from "$lib/itemType";
  import { mockedItems } from "$lib/data";
 
  let searchTerm = $state("");
  
  let filteredItems = $derived.by(() => mockedItems.filter((item) => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())));

  let openRow = $state();
  let details: ItemType | undefined = $state(); 
  let showDetailModal = $state(false);
  const toggleRow = (i: number) => {
    openRow = openRow === i ? null : i;
  }
</script>

<main class="flex-1 w-full overflow-auto">
  <header class="h-8 flex items-center bg-white">
    <h1 class="text-lg font-semibold text-gray-500">Inventory</h1>
  </header>

  <TableSearch placeholder="Search by name" hoverable bind:inputValue={searchTerm}>
    <TableHead>
      <TableHeadCell>Name</TableHeadCell>
      <TableHeadCell>Qty</TableHeadCell>
    </TableHead>
    <TableBody>
      {#each filteredItems as item, i (item.id)}
        <TableBodyRow onclick={() => { toggleRow(i); details = item; }} class={openRow === i ? "" : "dark:bg-gray-50 border-gray-200 border-b"}>
          <TableBodyCell>{item.name}</TableBodyCell>
          <TableBodyCell>{item.quantity}</TableBodyCell>
        </TableBodyRow>
        {#if openRow === i}
        <TableBodyRow
          class="dark:bg-gray-50 border-gray-200 border-b">
          <TableBodyCell colspan={4} class="p-0">
            <div class="px-6 py-4" transition:slide={{ duration: 300, axis: "y" }}>
              <ButtonGroup class="flex*:ring-primary-700!">
                <Button href="/barcode/{details?.id}">Barcode</Button>
                <Button onclick={() => { showDetailModal = true}}>Details</Button>
              </ButtonGroup>
            </div>
          </TableBodyCell>
        </TableBodyRow>
        {/if}
      {/each}
    </TableBody>
  </TableSearch>

  <Modal title="Details" form bind:open={showDetailModal}>
    <div>
      <p> { details?.name }</p>
    </div>
  </Modal>
</main>