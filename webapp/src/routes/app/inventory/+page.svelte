<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import SelectedRowDetail from './components/SelectedRowDetail.svelte';
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Table } from "flowbite-svelte"; // Table Components
  import { Alert , Button, Modal, Label, Input, Select, Helper, Toggle} from "flowbite-svelte"; // Generic
  import {BarcodeOutline } from "flowbite-svelte-icons"; // Icons
  import { type BarcodeType, type ItemType, type ItemState, type ItemCategory, type MeatSubCategory, type SeaFoodSubCategory } from "$lib/types/item";
  import { AllItemCategories, AllItemStates, AllMeatSubCategory, AllSeaFoodSubCategory } from "$lib/types/item";
  let { data } = $props();

  let items: ItemType[] = $state([]) 
  let prefixError = $state(false)

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
  let selectedCategory: ItemCategory =  $state(AllItemCategories[0]);
  let selectedMeatSubCategory: MeatSubCategory =  $state(AllMeatSubCategory[0]);
  let selectedSeaFoodSubCategory: SeaFoodSubCategory =  $state(AllSeaFoodSubCategory[0]);
  let selectedState: ItemState = $state(AllItemStates[0]); 
  let itemName: string = $state("")
  let barcodeControlledValue = $state(true);
  const existingPrefix: string[] = $derived(
    [...new Set(items.flatMap((item) => item.barcodePrefix ? [item.barcodePrefix] : []))]
  )

  let initials: string = $state("")
  function createInitialForBarcodePrefix() {
    initials = itemName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  let message = $state('');
  let errorMessage = $state('');
  let isLoading = $state(false);
  const submitNewItem: SubmitFunction = async ({ formElement }) => {
      isLoading = true;
      message = 'Submitting...';
      return async ({ result, update }) => {
        // 'result' is automatically typed based on your server action's return types
        if (result.type === 'success') {
          message = result.data?.message || 'Success!';
          formElement.reset();
        } else if (result.type === 'failure') {
          errorMessage = result.data?.description || 'An error occurred.';
        }

        isLoading = false;
        initials = ""
        // 'update()' re-runs load functions to update the page state
        await update();
      };
  };

  // Modal: Confirm delete
  let deleteMessage: string | undefined = $state('');
  let deleteErrorMessage: string | undefined = $state('');
  let openDeleteModal = $state(false);
    const deleteItem: SubmitFunction = async () => {
      return async ({ result, update }) => {
        // 'result' is automatically typed based on your server action's return types
        if (result.type === 'success') {
          deleteMessage = result.data?.message || 'Successfully deleted item!';
        } else if (result.type === 'failure') {
          deleteErrorMessage = result.data?.description || 'An error occurred.';
        }
        openDeleteModal = false
        await update();
        setTimeout(() => {
          deleteMessage = undefined
          deleteErrorMessage = undefined
        }, 5000);
      };
  };


 $effect(() => {
    items = data.items;
    if(barcodeControlledValue && existingPrefix.includes(initials)) {
      prefixError = true
    }else{
      prefixError = false
    }
  });
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
            {#if openRow === i}
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

  <Modal class="flex-1 max-h-4/5" bind:open={showBarcodeDetailModal}>
    <Button href="/barcode/{selectedItem!.id}">Generate New Barcode</Button>
    <div>
      <Table>
        <TableHead>
          <TableHeadCell>Code</TableHeadCell>
          <TableHeadCell>Age</TableHeadCell>
        </TableHead>
          <TableBody>
            {#each itemBarcodes as barcode (barcode.id)}
              <TableBodyRow class="bg-gray-50 dark:bg-gray-50 border-gray-50 border-b">
                <TableBodyCell>{barcode.code}</TableBodyCell>
                <TableBodyCell>{ Math.floor((Number(new Date()) - Number(new Date(barcode.createdAt))) / (1000 * 60 * 60 * 24))} Days</TableBodyCell>
              </TableBodyRow>
            {/each}
          </TableBody>
      </Table>
    </div>
  </Modal>

  <Button class="absolute inset-e-6 bottom-20" onclick={ () => {openAddItemModal=true }}> + </Button>
  <Modal title="Add" form bind:open={openAddItemModal}>
    <div>
      <form method="POST" action="?/addItem" use:enhance={submitNewItem}>
        {#if errorMessage}
          <div class="mb-6">
            <Alert color="red">
              <span class="font-medium">Error! {errorMessage}</span>
            </Alert>
          </div>
        {:else if message}
          <Alert color="green">
            <span class="font-medium"> { message }</span>
          </Alert>
        {/if}

        <div class="mb-6">
          <Label for="name" class="mb-2 block">Name</Label>
          <Input id="name" name="name" placeholder="Enter item name" onInput={() => createInitialForBarcodePrefix()} bind:value={itemName}/>
        </div>

        <div class="mb-6">
          <Toggle id="barcodeControlled" name="barcodeControlled" bind:checked={barcodeControlledValue}>Use barcode for item</Toggle>
          {#if barcodeControlledValue }
            {#if prefixError }
              <Label for="barcodePrefix" color="red" class="mb-2 block">Barcode Prefix</Label>
              <Input id="barcodePrefix" name="barcodePrefix" color="red" placeholder="Enter Barcode Prefix" bind:value={initials}/>
              <Helper class="mt-2" color="red">
                <span class="font-medium">Already exists! Manually enter a unique prefix</span>
              </Helper>
            {:else}
              <Label for="barcodePrefix" class="mb-2 block">Barcode Prefix</Label>
              <Input id="barcodePrefix" name="barcodePrefix" placeholder="Enter Barcode Prefix" value={initials}/>
            {/if}
          {/if}
        </div>

        <div class="mb-6">
          <Label for="category">Select Item Category:</Label>
          <Select id="category" name="category" bind:value={selectedCategory}>
            {#each AllItemCategories as category (category)}
              <option value={category}>{category}</option>
            {/each}
          </Select>
        </div>

        {#if selectedCategory === 'meat'}
          <div class="mb-6">
            <Label for="meat">Select Meat Type:</Label>
            <Select id="meat" name="meat" bind:value={selectedMeatSubCategory}>
              {#each AllMeatSubCategory as meat (meat)}
                <option value={meat}>{meat}</option>
              {/each}
            </Select>
          </div>
        {/if}

        {#if selectedCategory === 'seafood'}
          <div class="mb-6">
            <Label for="seafood">Select Seafood Type:</Label>
            <Select id="seafood" name="seafood" bind:value={selectedSeaFoodSubCategory}>
              {#each AllSeaFoodSubCategory as seafood (seafood)}
                <option value={seafood}>{seafood}</option>
              {/each}
            </Select>
          </div>
        {/if}

        <div class="mb-6">
          <Label for="state">Select State:</Label>
          <Select id="state" name="state" bind:value={selectedState}>
            {#each AllItemStates as state (state)}
              <option value={state}>{state}</option>
            {/each}
          </Select>
        </div>

        <div class="mb-6">
          <Button type="submit" disabled={prefixError || isLoading}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  </Modal>

  <Modal form bind:open={openDeleteModal}>
    <div>
      <form method="POST" action="?/deleteItem" use:enhance={deleteItem}>
        <Label for="state" class="py-4">
          Are you sure you want to delete {selectedItem?.name}?
        </Label>
        <input type="hidden" name="id" value={selectedItem!.id} />
        <Button type="submit"> Delete it! </Button>
      </form>
    </div>
  </Modal>
</main>