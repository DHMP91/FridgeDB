import { db } from '$lib/server/db/index.js';
import { barcode } from "$lib/server/db/schema.js"
import type { Barcode, NewBarcode } from "$lib/server/db/schema.js"
import { eq, and } from "drizzle-orm";

export class BarcodeModel {
    constructor() {
    }

    static async createBarcode(newBarcode: NewBarcode) {
        return await db.insert(barcode).values(newBarcode);
    }

    static async getBarcode(code: string): Promise<Barcode | undefined> {
        const records = await db.select().from(barcode).where(eq(barcode.code, code));
        return records.length === 0 ? undefined : records[0]
    }

    static async getItemBarcodes(itemId: number) {
        return await db.select().from(barcode).where(eq(barcode.itemId, itemId));
    }

    static async getActiveItemBarcodesCount(itemId: number) {
        return await db.$count(
            barcode,
            and(
                eq(barcode.itemId, itemId),
                eq(barcode.consumed, false)
            )
        );
    }

    static getPrefix(code: string): string {
        return code.split("-")[0]
    }

    static async updateBarcode(id: number, updatedBarCode: Partial<Barcode>) {
        return await db.update(barcode).set(updatedBarCode).where(eq(barcode.id, id))
    }
}