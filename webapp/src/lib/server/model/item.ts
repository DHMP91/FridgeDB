import { db } from '$lib/server/db/index.js';
import { item, barcode } from "$lib/server/db/schema.js"
import type { Item, NewItem } from "$lib/server/db/schema.js"
import { eq, sql} from "drizzle-orm";

export class ItemModel {
    static async createItem (newItem: NewItem) {
        return db.insert(item).values(newItem);
    }

    static async deleteItem (id: number) {
        return db.delete(item).where(eq(item.id, id))
    }

    static async getAllItems() {
        const barcodeCounts = db
            .select({
                itemId: barcode.itemId,
                quantity: sql<number>`COUNT(${barcode.id})`.as("quantity")
            })
            .from(barcode)
            .where(eq(barcode.consumed, false))
            .groupBy(barcode.itemId)
            .as("barcode_counts");

        const result = await db
            .select({
                id: item.id,
                name: item.name,
                state: item.state,
                category: item.category,
                meat: item.meat,
                seafood: item.seafood,
                barcodeControlled: item.barcodeControlled,
                barcodePrefix: item.barcodePrefix,
                createdAt: item.createdAt,
                quantity: sql<number>`
                CASE 
                    WHEN ${item.barcodeControlled} THEN COALESCE(${sql`barcode_counts.quantity`}, 0)
                    ELSE ${item.quantity}
                END
                `.as("quantity"),
            })
            .from(item)
            .leftJoin(
                barcodeCounts,
                eq(barcodeCounts.itemId, item.id)
            );
        return result
    }

    static async getItemById(id: number) {
        const records = await db
            .select()
            .from(item)
            .where(eq(item.id, id))
        return records.length === 0 ? undefined : records[0]
    }

    static async getItemByBarcodePrefix (prefix: string): Promise<Item | undefined> {
        const records = await db.select().from(item).where(eq(item.barcodePrefix, prefix))
        return records.length === 0 ? undefined : records[0]
    }

    static async updateItem(id: number, updateItem: Partial<Item>) {
        return await db.update(item).set(updateItem).where(eq(item.id, id))
    }
}