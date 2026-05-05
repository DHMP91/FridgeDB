<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
    import { Alert , Button, Modal, Label, Input, Select, Helper, Toggle} from "flowbite-svelte"; // Generic
    import { type ItemType, type ItemState, type ItemCategory, type MeatSubCategory, type SeaFoodSubCategory } from "$lib/types/item";
    import { AllItemCategories, AllItemStates, AllMeatSubCategory, AllSeaFoodSubCategory } from "$lib/types/item";
  
    let { 
        openModal = $bindable<boolean>(),
        existingPrefix,
        setOpenModal,
        editItem,
    } = $props<{ 
        openModal: boolean,
        existingPrefix: string[],
        setOpenModal: (value: boolean) => void,
        editItem: ItemType
    }>();

    let itemName: string = $state("")
    let selectedCategory: ItemCategory =  $state(AllItemCategories[0]);
    let selectedMeatSubCategory: MeatSubCategory =  $state(AllMeatSubCategory[0]);
    let selectedSeaFoodSubCategory: SeaFoodSubCategory =  $state(AllSeaFoodSubCategory[0]);
    let selectedState: ItemState = $state(AllItemStates[0]); 
    let barcodeControlledValue = $state(true);
    let initials: string = $state("")
    function createInitialForBarcodePrefix() {
      initials = itemName
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase();
    }

    let errorMessage = $state('');
    let isLoading = $state(false);

    $effect(() => {
        if (openModal) {
            itemName = $state.snapshot(editItem.name);
            selectedCategory = $state.snapshot(editItem.category);
            selectedMeatSubCategory = $state.snapshot(editItem.meat)
            selectedSeaFoodSubCategory = $state.snapshot(editItem.seafood);
            selectedState = $state.snapshot(editItem.state);
            barcodeControlledValue = $state.snapshot(editItem.barcodeControlled);
            initials = $state.snapshot(editItem.barcodePrefix);
            errorMessage = '';
            prefixError = false;
        }
    });

    const submitForm: SubmitFunction = async ({ formElement }) => {
        isLoading = true;
        return async ({ result, update }) => {
          // 'result' is automatically typed based on your server action's return types
          if (result.type === 'success') {
              initials = ""
              setOpenModal(false);
              invalidateAll();
              formElement.reset();
              editItem = null;
          } else if (result.type === 'failure') {
              errorMessage = result.data?.description || 'An error occurred.';
          }
          isLoading = false;
          update();
        };
    };

    let prefixError = $state(false)
    const existingPrefixWithoutItem = $derived(existingPrefix.filter( (item: string )=> item !== editItem.barcodePrefix))
    $effect(() => {
        if(barcodeControlledValue && existingPrefixWithoutItem.includes(initials)) {
            prefixError = true;
        }else{
            prefixError = false;
        }
    });
</script>

<Modal title="Edit" form bind:open={openModal} onclose={() => {setOpenModal(false); invalidateAll()}}>
    <div>
      <form method="POST" action="?/editItem" use:enhance={submitForm}>
        <input type="hidden" name="id" value={editItem.id} /> 
        {#if errorMessage}
          <div class="mb-6">
            <Alert color="red">
              <span class="font-medium">Error! {errorMessage}</span>
            </Alert>
          </div>
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