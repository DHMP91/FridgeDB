import type { Actions } from './$types';
// import { fail } from '@sveltejs/kit';

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
