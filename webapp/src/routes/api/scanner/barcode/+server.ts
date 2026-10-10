import { json } from '@sveltejs/kit';
import { BarcodeModel } from '$lib/server/model/barcode'
import { ItemModel } from '$lib/server/model/item'
import type { Barcode, NewBarcode } from "$lib/server/db/schema.js"

export async function POST({ request }) {
	const { code, force = false } = await request.json();
    try {
        const target: Barcode | undefined = await BarcodeModel.getBarcode(code);
        const barcodePrefix = BarcodeModel.getPrefix(code)
        const item = await ItemModel.getItemByBarcodePrefix(barcodePrefix)

        // Check for item
        if ( !item ){
            return json({ message: `No item found belonging to barcode ${code}!` }, { status: 404 });
        }

        if (!target) {
            // New barcode
            const newBarCode: NewBarcode = {
                code,
                itemId: item.id
            } 
            await BarcodeModel.createBarcode(newBarCode)
            return json({ message: `Barcode created for ${item.name}! ${item.quantity} in stock` }, { status: 201 });
        } else if (!target.consumed) {
            // Consumed barcode
            await BarcodeModel.updateBarcode(target.id, {consumed: true})
            return json({ message: `Consumed ${item.name}! ${item.quantity} in stock` }, { status: 200 });
        } else if (target.consumed && force ) {
            // Force re-add barcode
            await BarcodeModel.updateBarcode(target.id, {consumed: false})
            return json({ message: `Re-adding ${item.name}! ${item.quantity} in stock` }, { status: 200 });
        } else {
            // Already used barcode
            return json({ message: `Barcode already used for ${item.name}! ${item.quantity} in stock` }, { status: 410 });
        }
    } catch ( error ) {
        return json({ error }, { status: 500 });
    }
}

