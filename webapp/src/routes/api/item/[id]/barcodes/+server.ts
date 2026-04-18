import { json } from '@sveltejs/kit';
import { BarcodeModel } from '$lib/server/model/barcode'

export async function GET({ params }) {
    try {
        const items = await BarcodeModel.getItemBarcodes(Number(params.id))
        return json(items, { status: 200 })
    } catch ( error ) {
        return json({ error }, { status: 500 });
    }
}