import { error } from '@sveltejs/kit';
import { db } from "$lib/server/db/index.js"
import { item } from "$lib/server/db/schema"
import { eq  } from 'drizzle-orm' 

export async function load({ params }) {
	const itemId = Number(params.itemId)
	const selectedItem = await db
				.select()
				.from(item)
				.where(eq(item.id, itemId));

	if (selectedItem.length === 0) error(404);
	return {
		item: selectedItem[0]
	};
}
