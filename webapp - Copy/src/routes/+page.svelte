<script lang="ts">
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from "flowbite-svelte";
  import { ButtonGroup , Button, Modal } from "flowbite-svelte";
  import { slide } from "svelte/transition";
  let searchTerm = $state("");

  type ItemType = { 
    id: Number;
    name: string;
    type: string;
    date: string;
    quantity: Number;
  }; 

  const items: ItemType[] = [
    { id: 1, name: "Raw Ground Beef", type: "Ingredient", date: "2017-10-10", quantity: 5},
    { id: 2, name: "Raw Chicken Thigh", type: "Ingredient", date: "2018-10-10", quantity: 0},
    { id: 3, name: "Mexican Ground Beef", type: "Cooked", date: "2019-10-10", quantity: 1},
    { id: 4, name: "Cajun Chicken Thigh", type: "Cooked", date: "2020-10-10", quantity: 9}
  ];
  let filteredItems = $derived.by(() => items.filter((item) => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())));

  let openRow = $state();
  let details = $state();
  let doubleClickModal = $state(false);

  const toggleRow = (i: number) => {
    openRow = openRow === i ? null : i;
  };
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
      {#each filteredItems as item, i}
        <TableBodyRow onclick={() => toggleRow(i)} class={openRow === i ? "" : "dark:bg-gray-50 border-gray-200 border-b"}>
          <TableBodyCell>{item.name}</TableBodyCell>
          <TableBodyCell>{item.quantity}</TableBodyCell>
        </TableBodyRow>
        {#if openRow === i}
        <TableBodyRow
          class="dark:bg-gray-50 border-gray-200 border-b"
          ondblclick={() => {
            doubleClickModal = true;
            details = item;
          }}
        >
          <TableBodyCell colspan={4} class="p-0">
            <div class="px-6 py-4" transition:slide={{ duration: 300, axis: "y" }}>
              <ButtonGroup class="flex*:ring-primary-700!">
                <Button>Barcode</Button>
                <Button>Details</Button>
              </ButtonGroup>
            </div>
          </TableBodyCell>
        </TableBodyRow>
        {/if}
      {/each}
    </TableBody>
  </TableSearch>
</main>