

// Workaround drizzle infertype by copying and hardcoding type for client side. Everytime schema change this require change 
export type ItemType = { 
  id?: number;
  name: string;
  state: string;
  category: string;
  meat?: string | null;
  seafood?: string | null;
  quantity: number | null;
  barcodePrefix: string;
  createdDate?: Date | null;
  updatedAt?: Date | null;
}; 

export type BarcodeType = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    consumed: boolean | null;
    itemId: number | null;
}


export const AllItemStates = [ "raw", "cooked", "marinated", "prepped" ] as const;
type stateTuple = typeof AllItemStates
export type ItemState = stateTuple[number]

export const AllItemCategories = [ "meat", "seafood", "dairy", "fruit", "vegetable", "ingredient", "meal"] as const;
type categoryTuple = typeof AllItemCategories
export type ItemCategory = categoryTuple[number]

export const AllMeatSubCategory = [ "porc", "chicken", "beef"] as const;
type meatTuple = typeof AllMeatSubCategory
export type MeatSubCategory = meatTuple[number]

export const AllSeaFoodSubCategory = [ "fish", "shellfish" ] as const;
type seaFoodTuple = typeof AllSeaFoodSubCategory
export type SeaFoodSubCategory = seaFoodTuple[number]

  