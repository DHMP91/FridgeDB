import { db } from '$lib/server/db/index.js';
import { item, barcode } from "$lib/server/db/schema.js"
import type { Item, NewItem } from "$lib/server/db/schema.js"
import { eq, sql} from "drizzle-orm";

export class ItemModel {
    static barcodeCountsQuery = db
            .select({
                itemId: barcode.itemId,
                quantity: sql<number>`COUNT(${barcode.id})`.as("quantity")
            })
            .from(barcode)
            .where(eq(barcode.consumed, false))
            .groupBy(barcode.itemId)
            .as("barcode_counts");

    static getItemQuery() {
        return db
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
                updatedAt: item.updatedAt,
                image: item.image,
                quantity: sql<number>`
                    CASE
                        WHEN ${item.barcodeControlled}
                        THEN COALESCE(${sql`barcode_counts.quantity`}, 0)
                        ELSE ${item.quantity}
                    END
                `.as("quantity"),
            })
            .from(item)
            .leftJoin(
                ItemModel.barcodeCountsQuery,
                eq(ItemModel.barcodeCountsQuery.itemId, item.id)
            );
    }

    static async createItem (newItem: NewItem) {
        return db.insert(item).values(newItem);
    }

    static async deleteItem (id: number) {
        return db.delete(item).where(eq(item.id, id))
    }

    static async getAllItems() {
        return this.getItemQuery()
    }

    static async getItemById(id: number) {
        const [record] = await this.getItemQuery().where(eq(item.id, id))
        return record
    }

    static async getItemByBarcodePrefix (prefix: string): Promise<Item | undefined> {
        const [record] = await this.getItemQuery().where(eq(item.barcodePrefix, prefix))
        return record
    }

    static async updateItem(id: number, updateItem: Partial<Item>) {
        return await db.update(item).set(updateItem).where(eq(item.id, id))
    }
}