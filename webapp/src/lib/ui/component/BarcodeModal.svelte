<script  lang="ts">
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


    const submitPrint = async () => {
        const barcodePrefix = selectedItem.barcodePrefix
        const nanoid3 = nanoid(3);
        const barcode = `${barcodePrefix}-${nanoid3}-0`
        const canvas = document.createElement("canvas");
        canvas.width = 591;
        canvas.height = 354;

        // Draw barcode first
        JsBarcode(
          canvas,
          barcode,
          {
            format: "CODE128",
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
        const formData = new FormData();
        formData.append("barcodeBase64", base64);
        const resp = await fetch("?/printBarcode", {
          method: "POST",
          body: formData
        });

        if(resp.ok) {
          printSuccess = `Successfully sent ${barcode} for printing`
        } else {
          printError = `Issue sending ${barcode} for printing`
        }

        setTimeout(() => {
            printSuccess = ""
            printError = ""
        }, 5000);
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
    <Button onclick={ async () => { 
      await submitPrint()
    }}>Print Single Barcode</Button>
    <Button href="/barcode/{selectedItem.id}">Generate Barcode Sheet</Button>
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
    <!-- <div id="barcode_example" {@attach attachBarCode()}></div> -->
  </Modal>