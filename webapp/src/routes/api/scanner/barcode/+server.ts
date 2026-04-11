import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { barcode, item } from "$lib/server/db/schema.js"
import { eq } from "drizzle-orm";
import { type InferInsertModel } from "drizzle-orm"

export async function POST({ request }) {
	const { code } = await request.json();
    type barcodeType = InferInsertModel<typeof barcode>

    try {
        const barcodeRecords = await db.select().from(barcode).where(eq(barcode.code, code))
        if (barcodeRecords.length == 0) {
            const barcodePrefix = code.split("-")[0]
            const items = await db.select().from(item).where(eq(item.barcodePrefix, barcodePrefix))
            if ( items.length == 0){
                return json({ error:"No item matching barcode" }, { status: 404 });
            }
            const newBarCode: barcodeType = {
                code,
                itemId: items[0].id
            } 
            await db.insert(barcode).values(newBarCode);
            return json({ message: `barcode created for ${items[0].name}!` }, { status: 201 });
        } else if (!barcodeRecords[0].consumed) {
            await db.update(barcode).set({consumed: true}).where(eq(barcode.id, barcodeRecords[0].id))
            return json({ message: `Setting barcode as consumed!` }, { status: 200 });
        } else {
            return json({ message: `bar code already consumed!` }, { status: 410 });
        }
    } catch ( error ) {
        return json({ error }, { status: 500 });
    }
}

