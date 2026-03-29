import type { Actions } from './$types';

export const actions: Actions = {
	addItem: async (event) => {
		const formData = await event.request.formData();
		const state = formData.get('state');
		console.log(`Selected value on server:`, state); 
	}
};
