<script  lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
    import { Button, Modal, Label } from "flowbite-svelte"; // Generic
    import { type ItemType } from "$lib/types/item";

    let { 
        selectedItem = $bindable<ItemType>(),
        openModal = $bindable<boolean>(),
        setDeleteResult,
    } = $props<{ 
        selectedItem: ItemType,
        openModal: boolean,
        setDeleteResult: (value: {deleteMessage: string | undefined, deleteErrorMessage: string | undefined}) => void
    }>();


    const deleteItem: SubmitFunction = async () => {
      return async ({ result }) => {
        if (result.type === 'success') {
            setDeleteResult({deleteMessage: result.data?.message || 'Successfully deleted item!'})
        } else if (result.type === 'failure') {
            setDeleteResult({deleteErrorMessage: result.data?.description || 'An error occurred.'})
        }
    };
  };
</script>


<Modal form bind:open={openModal}>
<div>
    <form method="POST" action="?/deleteItem" use:enhance={deleteItem}>
    <Label for="state" class="py-4">
        Are you sure you want to delete {selectedItem.name}?
    </Label>
    <input type="hidden" name="id" value={selectedItem.id} />
    <Button type="submit"> Delete it! </Button>
    </form>
</div>
</Modal>