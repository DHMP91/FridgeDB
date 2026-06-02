<script  lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
    import { Button, Modal } from "flowbite-svelte"; // Generic
    import { type BarcodeType, type ItemType } from "$lib/types/item";
    import { Alert } from "flowbite-svelte"; // Generic
    // import type { Attachment } from 'svelte/attachments';
    import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Table } from "flowbite-svelte"; // Table Components
    import JsBarcode from "jsbarcode";
    import { nanoid } from 'nanoid';

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


    let printSuccess = $state('');
    let printError = $state('');


    const submitPrint: SubmitFunction  = async ({ formData, cancel}) => {
        const maxSize = 8
        const barcodePrefix = selectedItem.barcodePrefix
        if(maxSize < barcodePrefix.length){
          printError = `Prefix is too large for single printers. Max ${maxSize}`
          cancel()
          return
        }

        const nanoidStr = nanoid(maxSize - barcodePrefix.length);
        const barcode = `${barcodePrefix}-${nanoidStr}`
        const canvas = document.createElement("canvas");
        canvas.width = 591;
        canvas.height = 354;

        // Draw barcode first
        JsBarcode(
          canvas,
          barcode,
          {
            format: "CODE128B",
            width: 2,
            height: 100,
            marginTop: 80,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            displayValue: true
          }
        );

        // Then draw text
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.font = "20px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "right"
          ctx.textBaseline = "top";
          const dateNow = new Date().toLocaleDateString("en-CA");

          ctx.fillText(selectedItem.name, 0, 10);
          ctx.fillText(dateNow, 0, 40);
        }

        const base64 = canvas.toDataURL("image/png").split(",")[1];

        formData.append("name", `Print ${barcodePrefix} for ${selectedItem.name}`);
        formData.append("barcodeBase64", base64);
 
        return async ({ result, update }) => {
          // 'result' is automatically typed based on your server action's return types
          if (result.type === 'success') {
              printSuccess = `Successfully sent ${barcode} for printing`
          } else if (result.type === 'failure') {
              printError = `Issue sending ${barcode} for printing.\n ${result.data?.error}`
          }
          await update();
          setTimeout(() => {
              printSuccess = ""
              printError = ""
          }, 8000);
        };
    };

    // function attachBarCode(): Attachment {
    //   return (element) => {
    //     const canvas = document.createElement("canvas");
    //     canvas.width = 591;
    //     canvas.height = 354;

    //     // Draw barcode first
    //     JsBarcode(canvas, "test-123-123", {
    //       format: "CODE128",
    //       width: 2,
    //       height: 100,
    //       marginTop: 80,
    //       marginBottom: 0,
    //       marginLeft: 0,
    //       marginRight: 0,
    //       displayValue: true
    //     });

    //     // Then draw text
    //     const ctx = canvas.getContext("2d");

    //     if (ctx) {
    //       ctx.font = "20px Arial";
    //       ctx.fillStyle = "black";
    //       ctx.textAlign = "right"
    //       ctx.textBaseline = "top";

    //       ctx.fillText("PRODUCT NAME", 0, 0);
    //       ctx.fillText("TIMESTAMP", 0, 25);
    //     }

    //     element.appendChild(canvas);
    //   };
    // }

</script>


  <Modal class="flex-1 max-h-4/5" bind:open={openModal} onclose={() => {setOpenModal(false)}}>
    {#if printError}
      <div class="mb-6">
        <Alert color="red">
          <span class="font-medium">Error! {printError}</span>
        </Alert>
      </div>
    {:else if printSuccess}
      <Alert color="green">
        <span class="font-medium"> { printSuccess }</span>
      </Alert>
    {/if}
    <div>
      <Table>
        <TableHead>
          <TableHeadCell>Code</TableHeadCell>
          <TableHeadCell>Age</TableHeadCell>
        </TableHead>
          <TableBody>
            {#if itemBarcodes.length == 0}
              <TableBodyRow class="bg-gray-50 dark:bg-gray-50 border-gray-50 border-b"> 
                <TableBodyCell>No barcode scanned</TableBodyCell>
                <TableBodyCell></TableBodyCell>
              </TableBodyRow>
            {/if}
            {#each itemBarcodes as barcode (barcode.id)}
              <TableBodyRow class="bg-gray-50 dark:bg-gray-50 border-gray-50 border-b">
                <TableBodyCell>{barcode.code}</TableBodyCell>
                <TableBodyCell>{ Math.floor((Number(new Date()) - Number(new Date(barcode.createdAt))) / (1000 * 60 * 60 * 24))} Days</TableBodyCell>
              </TableBodyRow>
            {/each}
          </TableBody>
      </Table>
    </div>

    <div class="flex items-center gap-2">
      <form method="POST" action="?/printBarcode" use:enhance={submitPrint}>
        <Button type="submit">
          Print Single Barcode
        </Button>
      </form>

      <Button href={`/barcode/${selectedItem.id}`}>
        Generate Barcode Sheet
      </Button>
    </div>
    <!-- <div id="barcode_example" {@attach attachBarCode()}></div> -->
  </Modal>