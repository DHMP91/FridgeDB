<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
    import { Alert , Button, Modal, Label, Input, Select, Helper, Toggle} from "flowbite-svelte"; // Generic
    import { type ItemState, type ItemCategory, type MeatSubCategory, type SeaFoodSubCategory } from "$lib/types/item";
    import { AllItemCategories, AllItemStates, AllMeatSubCategory, AllSeaFoodSubCategory } from "$lib/types/item";
  
    let { 
        openAddItemModal = $bindable<boolean>(),
        existingPrefix,
        setOpenModal
    } = $props<{ 
        openAddItemModal: boolean
        existingPrefix: string[],
        setOpenModal: (value: boolean) => void
    }>();

    let selectedCategory: ItemCategory =  $state("meal");
    let selectedMeatSubCategory: MeatSubCategory =  $state(AllMeatSubCategory[0]);
    let selectedSeaFoodSubCategory: SeaFoodSubCategory =  $state(AllSeaFoodSubCategory[0]);
    let selectedState: ItemState = $state(AllItemStates[0]); 
    let itemName: string = $state("")
    let barcodeControlledValue = $state(false);

    let initials: string = $state("")
    function createInitialForBarcodePrefix() {
    initials = itemName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }

    let message = $state('');
    let errorMessage = $state('');
    let isLoading = $state(false);
    const submitNewItem: SubmitFunction = async ({ formElement }) => {
        isLoading = true;
        message = 'Submitting...';
        return async ({ result, update }) => {
          // 'result' is automatically typed based on your server action's return types
          if (result.type === 'success') {
              message = result.data?.message || 'Success!';
              formElement.reset();
          } else if (result.type === 'failure') {
              errorMessage = result.data?.description || 'An error occurred.';
          }

          isLoading = false;
          initials = ""
          // 'update()' re-runs load functions to update the page state
          await update();
        };
    };

    let prefixError = $state(false)
    $effect(() => {
        if(barcodeControlledValue && existingPrefix.includes(initials)) {
            prefixError = true
        }else{
            prefixError = false
        }

        const lowerCaseName = itemName.toLocaleLowerCase();
        type MeatSubCategory = (typeof AllMeatSubCategory)[number];
        type SeafoodSubCategory = (typeof AllSeaFoodSubCategory)[number];
        type FoodCategory = (typeof AllItemCategories)[number];

        const meatTerms: Record<MeatSubCategory, string[]> = {
            beef: ["beef", "steak", "brisket", "brisk", "veal", "boeuf", "bœuf", "veau"],
            porc: ["pork", "porc", "pig", "porkchop", "bacon", "ham", "prosciutto", "pancetta", "guanciale", "jambon"],
            duck: ["duck", "canard"],
            lamb: ["lamb", "agneau", "mutton", "sheep", "mouton"],
            chicken: ["chicken", "poulet", "hen", "poultry", "coq", "volaille"]
        };

        const seafoodTerms: Record<SeafoodSubCategory, string[]> = {
            fish: [
                "fish", "salmon", "tuna", "trout", "cod", "haddock", "halibut",
                "sardine", "anchovy", "mackerel", "tilapia", "bass", "sole",
                "poisson", "saumon", "thon", "truite", "morue", "aiglefin",
                "flétan", "anchois", "maquereau"
            ],
            shellfish: [
                "shellfish", "shrimp", "prawn", "crab", "lobster", "crayfish",
                "clam", "mussel", "oyster", "scallop", "squid", "octopus",
                "langoustine", "crevette", "crabe", "homard", "écrevisse",
                "palourde", "moule", "huître", "pétoncle", "calmar", "poulpe"
            ]
        };

        const categoryTerms: Record<Exclude<FoodCategory, "meat" | "seafood">, string[]> = {
            fruit: [
                "apple", "banana", "orange", "lemon", "lime", "strawberry",
                "blueberry", "raspberry", "grape", "watermelon", "melon",
                "mango", "pineapple", "pear", "peach", "plum",
                "pomme", "banane", "citron", "fraise", "framboise", "raisin",
                "pastèque", "mangue", "ananas", "poire", "pêche", "prune"
            ],
            vegetable: [
                "vegetable", "carrot", "potato", "onion", "tomato", "broccoli",
                "cauliflower", "cabbage", "lettuce", "spinach", "celery",
                "cucumber", "pepper", "zucchini", "eggplant", "mushroom",
                "corn", "asparagus", "radish", "turnip",
                "carotte", "pomme de terre", "oignon", "tomate", "chou",
                "épinard", "céleri", "concombre", "poivron", "courgette",
                "aubergine", "champignon", "maïs"
            ],
            ingredient: [
                "garlic", "ginger", "salt", "pepper", "sugar", "flour",
                "oil", "vinegar", "spice", "spices", "herb", "herbs",
                "basil", "parsley", "cilantro", "thyme", "rosemary",
                "cinnamon", "paprika", "cumin", "oregano", "mustard",
                "ail", "gingembre", "sel", "sucre", "farine", "huile",
                "vinaigre", "épice", "épices", "basilic", "persil",
                "coriandre", "thym", "romarin", "cannelle", "moutarde"
            ],
            dairy: [
                "milk", "cheese", "butter", "cream", "yogurt", "yoghurt",
                "whipping cream", "sour cream", "cottage cheese", "cream cheese",
                "mozzarella", "cheddar", "parmesan", "brie", "gouda",
                "lait", "fromage", "beurre", "crème", "yogourt", "yaourt",
                "crème fouettée", "crème sure", "fromage cottage",
                "fromage à la crème"
            ],
            meal: []
        };

        let detected = false;

        // Detect meat
        for (const [subcategory, terms] of Object.entries(meatTerms) as [MeatSubCategory, string[]][]) {
            if (terms.some(term => lowerCaseName.includes(term))) {
                selectedCategory = "meat";
                selectedMeatSubCategory = subcategory;
                selectedState = "raw";
                detected = true;
                break;
            }
        }

        // Detect seafood only if no meat match was found
        if (!detected) {
            for (const [subcategory, terms] of Object.entries(seafoodTerms) as [SeafoodSubCategory, string[]][]) {
                if (terms.some(term => lowerCaseName.includes(term))) {
                    selectedCategory = "seafood";
                    selectedSeaFoodSubCategory = subcategory;
                    selectedState = "raw";
                    detected = true;
                    break;
                }
            }
        }

        // Detect fruit, vegetable, or ingredient
        if (!detected) {
            for (const [category, terms] of Object.entries(categoryTerms) as [Exclude<FoodCategory, "meat" | "seafood">, string[]][]) {
                if (terms.some(term => lowerCaseName.includes(term))) {
                    selectedCategory = category;
                    // detected = true;
                    break;
                }
            }
        }

        if(selectedCategory.toLowerCase() === "meal"){
          selectedState = "cooked"
        }
    });
</script>

<Modal title="Add" form bind:open={openAddItemModal} onclose={() => {setOpenModal(false)}}>
    <div>
      <form method="POST" action="?/addItem" use:enhance={submitNewItem}>
        {#if errorMessage}
          <div class="mb-6">
            <Alert color="red">
              <span class="font-medium">Error! {errorMessage}</span>
            </Alert>
          </div>
        {:else if message}
          <Alert color="green">
            <span class="font-medium"> { message }</span>
          </Alert>
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