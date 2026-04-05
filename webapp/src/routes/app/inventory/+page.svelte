<script lang="ts">
  import { slide } from "svelte/transition";
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from "flowbite-svelte";
  import { ButtonGroup , Button, Modal, Label, Input, Select, Helper } from "flowbite-svelte";
  import { type ItemType, type ItemState, type ItemCategory, type MeatSubCategory, type SeaFoodSubCategory } from "$lib/types/item";
  import { AllItemCategories, AllItemStates, AllMeatSubCategory, AllSeaFoodSubCategory } from "$lib/types/item";
  let { data } = $props();

  let items: ItemType[] =$state([]) 
  let prefixError = $state(false)
  $effect(() => {
    items = data.items;
    if(existingPrefix.includes(initials)) {
      prefixError = true
    }else{
      prefixError = false
    }
  });

  // Table
  let searchTerm = $state("");
  let filteredItems = $derived.by(() => items.filter((item) => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())));
  let openRow = $state();
  let details: ItemType | undefined = $state(); 
  let showDetailModal = $state(false);
  const toggleRow = (i: number) => {
    openRow = openRow === i ? null : i;
  }


  // Modal: New Item Form
  let openAddItemModal = $state(false);
  let selectedCategory: ItemCategory =  $state(AllItemCategories[0]);
  let selectedMeatSubCategory: MeatSubCategory =  $state(AllMeatSubCategory[0]);
  let selectedSeaFoodSubCategory: SeaFoodSubCategory =  $state(AllSeaFoodSubCategory[0]);
  let selectedState: ItemState = $state(AllItemStates[0]); 
  let itemName: string = $state("")
  let initials: string = $state("")
  const existingPrefix: string[] = [...new Set(items.flatMap((item) => item.barcodePrefix ? [item.barcodePrefix] : []))]


  function handleInput() {
    initials = itemName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  let message = $state('');
  let isLoading = $state(false);
  const  submitNewItem: SubmitFunction = async ({ formElement }) => {
      isLoading = true;
      message = 'Submitting...';
      return async ({ result, update }) => {
        // 'result' is automatically typed based on your server action's return types
        if (result.type === 'success') {
          message = result.data?.message || 'Success!';
          formElement.reset();
        } else if (result.type === 'failure') {
          message = result.data?.description || 'An error occurred.';
        }

        isLoading = false;
        // 'update()' re-runs load functions to update the page state
        await update();
      };
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

  <Button class="absolute inset-e-6 bottom-20" onclick={ () => {openAddItemModal=true }}> + </Button>

  <Modal title="Details" form bind:open={showDetailModal}>
    <div>
      <p> { details?.name }</p>
    </div>
  </Modal>

  <Modal title="Add" form bind:open={openAddItemModal}>
    <div>
      <form method="POST" action="?/addItem" use:enhance={submitNewItem}>
        {#if message}
          <p>{message}</p>
        {/if}
        <div class="mb-6">
          <Label for="name" class="mb-2 block">Name</Label>
          <Input id="name" placeholder="Enter item name" onInput={() => handleInput()} bind:value={itemName}/>
        </div>

        <div class="mb-6">
          {#if prefixError }
            <Label for="barcodePrefix" color="red" class="mb-2 block">Barcode Prefix</Label>
            <Input id="barcodePrefix" color="red" placeholder="Enter Barcode Prefix" bind:value={initials}/>
            <Helper class="mt-2" color="red">
              <span class="font-medium">Already exists! Manually enter a unique prefix</span>
            </Helper>
          {:else}
            <Label for="barcodePrefix" class="mb-2 block">Barcode Prefix</Label>
            <Input id="barcodePrefix" placeholder="Enter Barcode Prefix" value={initials}/>
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
</main>