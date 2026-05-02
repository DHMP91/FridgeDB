<script lang="ts">
	import { invalidateAll } from '$app/navigation';
  import { 
    Table,
    TableHead, 
    TableHeadCell, 
    TableBody, 
    TableBodyCell, 
    TableBodyRow
  } from "flowbite-svelte"; // Table Components
  import { Alert , Button, Input } from "flowbite-svelte"; // Generic
  import { BarcodeOutline } from "flowbite-svelte-icons"; // Icons
  import { type BarcodeType, type ItemType } from "$lib/types/item";
  import BarcodeModal from '$lib/ui/component/BarcodeModal.svelte';
  import DeleteItemModal from '$lib/ui/component/DeleteItemModal.svelte';
  import NewItemModal from '$lib/ui/component/NewItemModal.svelte';
  import SelectedRowDetail from '$lib/ui/component/SelectedRowDetail.svelte';

  // Load data
  let { data } = $props();
  let items: ItemType[] = $state([])
  $effect(() => { items = data.items })
  const existingPrefix: string[] = $derived(
      [...new Set(items.flatMap((item) => item.barcodePrefix ? [item.barcodePrefix] : []))]
  )

  // Table
  let searchTerm = $state("");
  let filteredItems = $derived.by(() => items.filter((item) => !searchTerm || item.name.replaceAll(' ', '').toLowerCase().includes(searchTerm.toLowerCase())));
  let openRow = $state();
  let selectedId: number | undefined = $state();
  const selectedItem = $derived(items.find((item) => item.id === selectedId));

  // Modal: Barcodes
  let itemBarcodes: BarcodeType[]= $state([]);
  let showBarcodeDetailModal = $state(false);
  const toggleRow = (i: number) => {
    openRow = openRow === i ? null : i;
  }
  async function getBarcodes (id: number) {
    const res = await fetch(`/api/item/${id}/barcodes`, {
			method: 'GET'
    });
    itemBarcodes = await res.json()
	}

  // Modal: New Item Form
  let openAddItemModal = $state(false);

  // Modal: Confirm delete
  let deleteMessage: string | undefined = $state('');
  let deleteErrorMessage: string | undefined = $state('');
  let openDeleteModal = $state(false);
  const setDeleteResult = (value: {deleteMessage: string | undefined , deleteErrorMessage: string | undefined}) => { 
      deleteMessage = value.deleteMessage
      deleteErrorMessage = value.deleteErrorMessage
      openRow = undefined
      openDeleteModal = false
      selectedId = undefined
      invalidateAll()
  }
</script>

<main class="flex-1 w-full">
  <header class="h-8 flex items-center bg-white">
    <h1 class="text-lg font-semibold text-gray-500 pr-10 ">Inventory</h1>
      <div class="max-w-100 mt-5 mb-5">
        {#if deleteErrorMessage}
          <Alert color="red">
            <span class="font-medium">Error! {deleteErrorMessage}</span>
          </Alert>
        {:else if deleteMessage}
          <Alert color="green">
            <span class="font-medium"> { deleteMessage }</span>
          </Alert>
        {/if}
      </div>
  </header>

  <div class="max-w-100 mt-5 mb-5">
      <Input placeholder="Search by name" bind:value={searchTerm}/>
  </div>


  <div class="relative w-full max-h-3/5 overflow-y-auto">
    <Table hoverable>
      <TableHead>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Qty</TableHeadCell>
      </TableHead>
        <TableBody>
          {#each filteredItems as item, i (item.id)}
            <TableBodyRow onclick={() => { toggleRow(i); selectedId = item.id; }} class={openRow === i ? "bg-gray-50 dark:bg-gray-50 border-gray-50 border-b" : "dark:bg-gray-50 border-gray-200 border-b"}>
              <TableBodyCell>
                <div class="flex gap-4">
                  {item.name}
                  {#if item.barcodeControlled }<BarcodeOutline class="shrink-0 h-6 w-6" /> {/if}
                </div>
              </TableBodyCell>
              <TableBodyCell>{openRow !== i || item.barcodeControlled ? item.quantity : ""}</TableBodyCell>
            </TableBodyRow>
            {#if openRow === i && selectedItem}
              <SelectedRowDetail 
                {selectedItem} 
                {getBarcodes} 
                setShowBarcodeDetailModal = {(value: boolean) => { showBarcodeDetailModal = value} } 
                setOpenDeleteModal = {(value: boolean) => openDeleteModal = value}
              />
            {/if}
          {/each}
        </TableBody>
    </Table>
  </div>

  {#if selectedItem && itemBarcodes }
    <BarcodeModal
      {selectedItem} 
      {itemBarcodes}
      openModal = {showBarcodeDetailModal}
      setOpenModal = { (value: boolean) => { showBarcodeDetailModal = value}}
    />
  {/if}

  <Button class="absolute inset-e-6 bottom-20" onclick={ () => { openAddItemModal = true }}> + </Button>
  <NewItemModal
    {openAddItemModal} 
    {existingPrefix} 
    setOpenModal = {(value: boolean) => { openAddItemModal = value}}
  />


  {#if selectedItem }
    <DeleteItemModal 
      {selectedItem} 
      openModal = {openDeleteModal}
      {setDeleteResult}
    />
  {/if}
</main>