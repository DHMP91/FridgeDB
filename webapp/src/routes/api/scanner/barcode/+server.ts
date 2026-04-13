import { json } from '@sveltejs/kit';
import { BarcodeModel } from '$lib/server/model/barcode'
import { ItemModel } from '$lib/server/model/item'
import type { Barcode, NewBarcode } from "$lib/server/db/schema.js"

export async function POST({ request }) {
	const { code, force = "false" } = await request.json();
    try {
        const target: Barcode | undefined = await BarcodeModel.getBarcode(code);
        if (!target) {
            // New barcode
            const barcodePrefix = BarcodeModel.getPrefix(code)
            const item = await ItemModel.getItemByBarcodePrefix(barcodePrefix)
            if ( !item ){
                return json({ error:"No item matching barcode" }, { status: 404 });
            }
            const newBarCode: NewBarcode = {
                code,
                itemId: item.id
            } 
            await BarcodeModel.createBarcode(newBarCode)
            return json({ message: `barcode created for ${item.name}!` }, { status: 201 });
        } else if (!target.consumed) {
            // Consumed barcode
            await BarcodeModel.updateBarcode(target.id, {consumed: true})
            return json({ message: `Setting barcode as consumed!` }, { status: 200 });
        } else if (target.consumed && force ) {
            // Force re-add barcode
            await BarcodeModel.updateBarcode(target.id, {consumed: false})
            return json({ message: `Setting barcode as consumed!` }, { status: 200 });
        } else {
            // Already used barcode
            return json({ message: `bar code already consumed!` }, { status: 410 });
        }
    } catch ( error ) {
        return json({ error }, { status: 500 });
    }
}

