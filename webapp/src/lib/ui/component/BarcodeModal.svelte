<script  lang="ts">
    import { Button, Modal } from "flowbite-svelte"; // Generic
    import { type BarcodeType, type ItemType } from "$lib/types/item";
    import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Table } from "flowbite-svelte"; // Table Components

    let { 
        selectedItem = $bindable<ItemType>(),
        itemBarcodes = $bindable<BarcodeType[]>(),
        openModal = $bindable<boolean>(),
        setOpenModal
    } = $props<{ 
        selectedItem: ItemType,
        itemBarcodes: BarcodeType[],
        openModal: boolean,
        setOpenModal: (value: boolean) => void
    }>();

</script>


  <Modal class="flex-1 max-h-4/5" bind:open={openModal} onclose={() => {setOpenModal(false)}}>
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