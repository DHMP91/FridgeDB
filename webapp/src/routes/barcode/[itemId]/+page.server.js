import { error } from '@sveltejs/kit';
import { mockedItems } from '$lib/data.js';

export function load({ params }) {
	const item = mockedItems.find((item) => item.id === Number(params.itemId));

	if (!item) error(404);

	return {
		item
	};
}
