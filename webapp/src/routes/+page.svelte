<script lang="ts">
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from "flowbite-svelte";
  import { ButtonGroup , Button, Modal } from "flowbite-svelte";
  import { slide } from "svelte/transition";
  import type { Attachment } from 'svelte/attachments';
  import JsBarcode from "jsbarcode";
  import PrintPdf from "svelte-printpdf"
  import { nanoid } from 'nanoid';
  import { tick } from 'svelte';
  let searchTerm = $state("");

  type ItemType = { 
    id: number;
    name: string;
    type: string;
    date: string;
    quantity: number;
    barcode_prefix?: string;
  }; 

  const items: ItemType[] = [
    { id: 1, name: "Raw Ground Beef", type: "Ingredient", date: "2017-10-10", quantity: 5, barcode_prefix: "RGB"},
    { id: 2, name: "Raw Chicken Thigh", type: "Ingredient", date: "2018-10-10", quantity: 0},
    { id: 3, name: "Mexican Ground Beef", type: "Cooked", date: "2019-10-10", quantity: 1},
    { id: 4, name: "Cajun Chicken Thigh", type: "Cooked", date: "2020-10-10", quantity: 9}
  ];
  let filteredItems = $derived.by(() => items.filter((item) => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())));

  let openRow = $state();
  let details: ItemType | undefined = $state(); 
  let barCodeModal = $state(false);

  const toggleRow = (i: number) => {
    openRow = openRow === i ? null : i;
  }

  let print = $state(false);
  let showBarcode = $state(false);
  const nanoid6 = nanoid(6);
  function attachBarCode (item: ItemType | undefined, index: number): Attachment {
    return (element) => {
      JsBarcode(
        element, 
        item ? `${item.barcode_prefix}-${nanoid6}-${index}` : "unknown",
        { 
          width:1,
          height:40
        }
      );
    }
	};
  
  function handleAfterPrint() {
    print=false;
    showBarcode=false;
  }
</script>

<svelte:window onafterprint={handleAfterPrint}/>

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
        <TableBodyRow onclick={() => toggleRow(i)} class={openRow === i ? "" : "dark:bg-gray-50 border-gray-200 border-b"}>
          <TableBodyCell>{item.name}</TableBodyCell>
          <TableBodyCell>{item.quantity}</TableBodyCell>
        </TableBodyRow>
        {#if openRow === i}
        <TableBodyRow
          class="dark:bg-gray-50 border-gray-200 border-b">
          <TableBodyCell colspan={4} class="p-0">
            <div class="px-6 py-4" transition:slide={{ duration: 300, axis: "y" }}>
              <ButtonGroup class="flex*:ring-primary-700!">
                <Button onclick={() => {
                  barCodeModal = true;
                  details = item;
                }}>Barcode</Button>
                <Button>Details</Button>
              </ButtonGroup>
            </div>
          </TableBodyCell>
        </TableBodyRow>
        {/if}
      {/each}
    </TableBody>
  </TableSearch>

  <Modal title="BarCode" form bind:open={barCodeModal}>
    <div>
      <p> { details?.name }</p>
      <Button onclick={ async () => { 
        showBarcode = true
        await tick();
        print = true 
      }}> Print Barcode Sheet</Button>
      <div class={ showBarcode ? "" : "hidden" }>
        <PrintPdf bind:print={ print }>
          <div class="p-4 bg-white">
            <div class="flex">
              <!-- Column 1 -->
              <div class="w-1/3 p-4">
                <div class="flex flex-col">
                  {#each Array(10) as _, index (index)}
                    <svg id="barcode" {@attach attachBarCode(details, index + 1)}>
                    </svg>
                  {/each}
                </div>
              </div>

              <!-- Column 2 -->
              <div class="w-1/3 p-4">
                <div class="flex flex-col">
                  {#each Array(10) as _, index (index)}
                    <svg id="barcode" {@attach attachBarCode(details, index + 11)}>
                    </svg>
                  {/each}
                </div>
              </div>

              <!-- Column 3 -->
              <div class="w-1/3 p-4">
                <div class="flex flex-col">
                  {#each Array(10) as _, index (index)}
                    <svg id="barcode" {@attach attachBarCode(details, index + 21)}>
                    </svg>
                  {/each}
                </div>
              </div>
            </div>

            <div class="text-xl w-full align-middle">
              {details?.name}
            </div>
          </div>
        </PrintPdf>
      </div>
    </div>
  </Modal>
</main>