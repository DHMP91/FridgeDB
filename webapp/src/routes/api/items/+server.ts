import { ItemModel } from '$lib/server/model/item'
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const items = await ItemModel.getAllItems()
        return json(items, {status: 200})
    } catch ( error ) {
        return json({ error }, { status: 500 });
    }
}