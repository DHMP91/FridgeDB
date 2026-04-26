import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { ItemModel } from '$lib/server/model/item'
import type { NewItem } from '$lib/server/db/item.schema'

export async function load() {
	const items = await ItemModel.getAllItems();
	return {
		items
	};
}


export const actions: Actions = {
	addItem: async (event) => {
		const formData = await event.request.formData();
		if(formData === null || formData === undefined) { 
			return fail(422, {
				description: "Form data is null or undefined",
				error: "No form data"
			})
		};
		if( formData.get('name') === null || 
			formData.get('state') === null || 
			formData.get('category') === null
		) { 
			return fail(422, {
				description: "One of the following required field is missing: name, state, category",
				error: "Missing required field",
			})
		};
		try {
			const newItem: NewItem = {
				name: formData.get('name')!.toString(),
				state: formData.get('state')!.toString(),
				category: formData.get('category')!.toString(),
				meat: formData.get('meat')?.toString(),
				seafood: formData.get('seafood')?.toString(),
				quantity: formData.get('quantity') ? Number(formData.get('quantity')) : 0,
				barcodeControlled: formData.get('quantity') ? true : false,
				barcodePrefix: formData.get('barcodePrefix') ? formData.get('barcodePrefix')?.toString() : null,
			}
			await ItemModel.createItem(newItem);
		} catch ( error ) {
			const errMsg = error instanceof Error ? error.message : String(error)
			return fail(422, {
				description: errMsg ,
				error: "Error creating new item",
			});
		}
		
	},
	deleteItem: async (event) => {
		const formData = await event.request.formData();
		if(formData === null || formData === undefined) { 
			return fail(422, {
				description: "Form data is null or undefined",
				error: "No form data"
			})
		};
		if( formData.get('id') === null ) { 
			return fail(422, {
				description: "One of the following required field is missing: id",
				error: "Missing required field",
			})
		};

		try {
			const id = Number(formData.get('id'))
			await ItemModel.deleteItem(id);
			return { message: `Successfully deleted item id ${id}!`}
		} catch ( error ) {
			const errMsg = error instanceof Error ? error.message : String(error)
			return fail(422, {
				description: errMsg ,
				error: "Error deleting item",
			});
		}
	},
	updateQty: async (event) => {
		const formData = await event.request.formData();
		if(formData === null || formData === undefined) { 
			return fail(422, {
				description: "Form data is null or undefined",
				error: "No form data"
			})
		};
		if( formData.get('id') === null || formData.get('updateQty') === null ) { 
			return fail(422, {
				description: "One of the following required field is missing: id, updateQty",
				error: "Missing required field",
			})
		};
		try {
			const id = Number(formData.get('id'))
			const qty = Number(formData.get('updateQty'))
			await ItemModel.updateItem(id, {quantity: qty});
			return { message: `Successfully updated quantity to ${qty} for item id ${id}!`}
		} catch ( error ) {
			const errMsg = error instanceof Error ? error.message : String(error)
			return fail(422, {
				description: errMsg ,
				error: "Error updating item quantity",
			});
		}
	}
};
