import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { ItemModel } from '$lib/server/model/item'
import type { NewItem, Item } from '$lib/server/db/item.schema'
import { PrinterFactory } from '$lib/server/printer/printer-factory';
import type { PrintJob } from '$lib/server/printer/abstract-printer';

export async function load() {
	const items = await ItemModel.getAllItems();
	const printerInst = await PrinterFactory.getPrinter()
	let printerEnabled = false
	let printJobs: PrintJob[] = []
	if(printerInst){
		printerEnabled = true
		printJobs = printerInst.getPendingJobs();
	}
	return {
		items,
		printerInfo: {
			printerEnabled,
			printJobs
		}
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
				barcodeControlled: formData.get('barcodeControlled') == "on" ? true : false,
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
	editItem: async (event) => {
		const formData = await event.request.formData();
		if(formData === null || formData === undefined) { 
			return fail(422, {
				description: "Form data is null or undefined",
				error: "No form data"
			})
		};
		if( formData.get('id') === null ||
			formData.get('name') === null || 
			formData.get('state') === null || 
			formData.get('category') === null
		) { 
			return fail(422, {
				description: "One of the following required field is missing: id, name, state, category",
				error: "Missing required field",
			})
		};
		try {
			const id = Number(formData.get('id')!.toString())
			const updateItem: Partial<Item>= {
				name: formData.get('name')!.toString(),
				state: formData.get('state')!.toString(),
				category: formData.get('category')!.toString(),
				meat: formData.get('meat') ? formData.get('meat')!.toString() : null,
				seafood: formData.get('seafood') ? formData.get('seafood')!.toString() : null,
				barcodeControlled: formData.get('barcodeControlled') == "on" ? true : false,
				barcodePrefix: formData.get('barcodePrefix') ? formData.get('barcodePrefix')!.toString() : null,
			}
			await ItemModel.updateItem(id, updateItem);
		} catch ( error ) {
			const errMsg = error instanceof Error ? error.message : String(error)
			return fail(422, {
				description: errMsg ,
				error: "Error updating item",
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
	},
	printBarcode: async (event) => {
		const formData = await event.request.formData();
		if(formData === null || formData === undefined) { 
			return fail(422, {
				description: "Form data is null or undefined",
				error: "No form data"
			})
		};
		if( formData.get('barcodeBase64') === null &&  formData.get('name') === null) { 
			return fail(422, {
				description: "One of the following required field is missing: barcodeBase64",
				error: "Missing required field",
			})
		};
		try {
			const name = formData.get("name")!.toString()
			const image = formData.get('barcodeBase64')!.toString()
			const printerInst = await PrinterFactory.getPrinter()
			if(printerInst) { 
				await printerInst.enqueue({ name, payload: image})
				return { message: `Successfully queued barcode for print`}
			}else {
				return fail(422, {
					description: "No Printer" ,
					error: "No Printer configured. Check environment config file",
				});
			}
		} catch ( error ) {
			const errMsg = error instanceof Error ? error.message : String(error)
			return fail(422, {
				description: errMsg ,
				error: "Error queuing barcode for print",
			});
		}
	}
};
