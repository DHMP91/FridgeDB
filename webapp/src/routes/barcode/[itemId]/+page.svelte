
<script lang="ts">
    import { Button } from "flowbite-svelte";
    import { type ItemType } from "$lib/itemType";
    import PrintPdf from "svelte-printpdf"
    import type { Attachment } from 'svelte/attachments';
    import JsBarcode from "jsbarcode";
    import { nanoid } from 'nanoid';
    let print = $state(false);
    let { data } = $props();

    const nanoid6 = nanoid(6);
    function attachBarCode (item: ItemType | undefined, index: number): Attachment {
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
</script>


<svelte:window onafterprint={handleAfterPrint}/>
<div >
  <Button onclick={ async () => { print = true }}>Print sheet</Button>
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