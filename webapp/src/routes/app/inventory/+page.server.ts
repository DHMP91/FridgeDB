import type { Actions } from './$types';
import { db } from "$lib/server/db/index.js"
import { item } from "$lib/server/db/schema"

export async function load() {
	const items = await db.select().from(item)
	return {
		items
	};
}


export const actions: Actions = {
	addItem: async (event) => {
		const formData = await event.request.formData();
		const state = formData.get('state');
		console.log(`Selected value on server:`, state); 
		// return fail(422, {
		// 	description: "test description",
		// 	error: "test error message"
		// });
	}
};
