
<script lang="ts">
    import { Button } from "flowbite-svelte";
    import type { Item } from "$lib/server/db/schema";
    import PrintPdf from "svelte-printpdf"
    import type { Attachment } from 'svelte/attachments';
    import JsBarcode from "jsbarcode";
    import { nanoid } from 'nanoid';
    let print = $state(false);
    let { data } = $props();

    // Sheet
    const nanoid6 = nanoid(6);
    function attachBarCode (item: Item | undefined, index: number): Attachment {
        return (element) => {
            JsBarcode(
                element, 
                item ? `${item.barcodePrefix}-${nanoid6}-${index}` : "unknown",
                { 
                    width:1,
                    height:40
                }
            );
        }
    };

    function handleAfterPrint() {
        print=false;
    };

    // CSV
    function downloadCSV(item: Item, amount: number) {
      const csvData = [];
      for(let i = 0; i < amount; i++){
        csvData.push(`${item.barcodePrefix}-${nanoid6}-${i + 1}`)
      }
      const csvContent = csvData.join("\n")
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "avery8167.csv";
      link.click();
      URL.revokeObjectURL(url);
    }
</script>


<svelte:window onafterprint={handleAfterPrint}/>
<div >
  <Button onclick={ async () => { print = true }}>Print sheet</Button>
  <Button onclick={ async () => { downloadCSV(data.item, 80) }}>Download CSV</Button>
  <PrintPdf bind:print={ print }>
    <div class="p-4 bg-white">
      <div class="flex">
        <!-- Column 1 -->
        <div class="w-1/3 p-4">
          <div class="flex flex-col">
            {#each Array(10) as _, index (index)}
              <svg id="barcode" {@attach attachBarCode(data.item, index + 1)}>
              </svg>
            {/each}
          </div>
        </div>

        <!-- Column 2 -->
        <div class="w-1/3 p-4">
          <div class="flex flex-col">
            {#each Array(10) as _, index (index)}
              <svg id="barcode" {@attach attachBarCode(data.item, index + 11)}>
              </svg>
            {/each}
          </div>
        </div>

        <!-- Column 3 -->
        <div class="w-1/3 p-4">
          <div class="flex flex-col">
            {#each Array(10) as _, index (index)}
              <svg id="barcode" {@attach attachBarCode(data.item, index + 21)}>
              </svg>
            {/each}
          </div>
        </div>
      </div>

      <div class="text-xl w-full align-middle">
        {data.item.name}
      </div>
    </div>
  </PrintPdf>
</div>