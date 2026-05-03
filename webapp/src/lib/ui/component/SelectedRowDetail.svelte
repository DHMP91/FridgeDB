<script lang="ts">
    import { onDestroy } from 'svelte';
    import { slide } from "svelte/transition";
    import type { SubmitFunction } from '@sveltejs/kit';
    import { enhance } from '$app/forms';
    import { TableBodyCell, TableBodyRow} from "flowbite-svelte"; // Table Components
    import {  Badge, ButtonGroup , Button, Label, Input } from "flowbite-svelte"; // Generic
    import { BarcodeOutline, EditOutline, MinusOutline, PlusOutline, TrashBinOutline } from "flowbite-svelte-icons"; // Icons
    import { type ItemType } from "$lib/types/item";
    
    let { 
        selectedItem = $bindable<ItemType>(), 
        setShowBarcodeDetailModal,
        getBarcodes,
        setOpenDeleteModal,
        setOpenEditModal
    } = $props<{ 
        selectedItem: ItemType | undefined, 
        setShowBarcodeDetailModal: (value: boolean) => void,
        getBarcodes: (id: number) => Promise<void>,
        setOpenDeleteModal: (value: boolean) => void,
        setOpenEditModal: (value: boolean) => void
    }>();

    //Update item quantity form (for Non-Barcode Items)
    let itemQty = $derived(selectedItem?.quantity)
    let qtyTimeout : NodeJS.Timeout;
    let qtyUpdateForm: HTMLFormElement | null = $state(null);
    const incrementQty = () => { itemQty += 1; updateQty(); }
    const decrementQty = () => { itemQty -= 1; updateQty(); }
    const updateQty  = () => {
        if ( !selectedItem ){
        return
        }
        clearTimeout(qtyTimeout);

        qtyTimeout = setTimeout(() => {
        qtyUpdateForm?.requestSubmit(); // Triggers the native submit event
        }, 1000);
    }
    
    const onSubmitUpdateQty: SubmitFunction = async () => {
        return async ({ result, update }) => {
            if (result.type === 'success') {
            await update();
            }
        };
    };
    onDestroy(() => clearTimeout(qtyTimeout));
</script>
<TableBodyRow class="bg-gray-50 dark:bg-gray-50 border-gray-200 border-y">
    <TableBodyCell class="p-0">
        <div transition:slide={{ duration: 300, axis: "y" }}>
        <div class="px-4">
            <Badge rounded> { selectedItem!.state } </Badge>
            <Badge color="pink" rounded> { selectedItem!.category } </Badge>
            {#if selectedItem!.meat } <Badge color="red" rounded> { selectedItem!.meat } </Badge> {/if}
            {#if selectedItem!.seafood } <Badge color="indigo" rounded> { selectedItem!.seafood } </Badge> {/if}
            {#if selectedItem!.barcodeControlled }<Badge color="gray" rounded> { selectedItem!.barcodePrefix } </Badge> {/if}
        </div>
        <div class="px-4 py-4">
            {#if selectedItem !== null || selectedItem!== undefined }
            <ButtonGroup class="flex*:ring-primary-700!">
                <Button onclick={ async () => { 
                    setOpenEditModal(true)
                }}><EditOutline class="shrink-0 h-6 w-6" /></Button>
                {#if selectedItem.barcodeControlled }
                <Button onclick={ async () => { 
                    await getBarcodes(selectedItem!.id!);
                    setShowBarcodeDetailModal(true);
                }}><BarcodeOutline class="shrink-0 h-6 w-6" /></Button>
                {/if}
                <Button onclick={ async () => { 
                    setOpenDeleteModal(true);
                }}><TrashBinOutline class="shrink-0 h-6 w-6" /></Button>
            </ButtonGroup>
            {/if}
        </div>
        </div>
    </TableBodyCell>
     <TableBodyCell class="p-0 flex items-start">
        {#if !selectedItem?.barcodeControlled }
            <form bind:this={qtyUpdateForm} method="POST" action="?/updateQty" use:enhance={onSubmitUpdateQty}>
            <input type="hidden" name="id" value={selectedItem!.id} />
            <Label for="updateQty" class="mb-1 text-sm text-gray-900 dark:text-white">Adjust quantity:</Label>
            <div class="relative flex items-center gap-2">
                <Button color="alternative" class="h-5 w-5 rounded-xl p-2" onclick={ decrementQty }>
                <MinusOutline class="h-2.5 w-2.5" />
                </Button>
                <Input 
                    id="updateQty" 
                    name="updateQty" 
                    type="number" 
                    class="w-12! shrink-0 border-0 bg-transparent p-0 text-center dark:bg-transparent" 
                    placeholder="" 
                    bind:value={itemQty} 
                    required 
                />
                <Button color="alternative" class="h-5 w-5 rounded-xl p-2" onclick={incrementQty}>
                <PlusOutline class="h-2.5 w-2.5" />
                </Button>
            </div>
            </form>
        {/if}
    </TableBodyCell>
</TableBodyRow>