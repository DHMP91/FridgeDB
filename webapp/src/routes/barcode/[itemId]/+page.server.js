import { error } from '@sveltejs/kit';
import { ItemModel } from '$lib/server/model/item.js'

export async function load({ params }) {
	const itemId = Number(params.itemId)
	const selectedItem = await ItemModel.getItemById(itemId)
	if (!selectedItem) error(404);
	return {
		item: selectedItem
	};
}
