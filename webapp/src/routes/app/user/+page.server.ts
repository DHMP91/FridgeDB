import { redirect } from '@sveltejs/kit';
import type { Actions } from '../../auth/$types';
import { auth } from '$lib/server/auth';
import { env } from '$env/dynamic/private';
import { db } from "$lib/server/db/index.js"
import { apikey } from "$lib/server/db/schema" 
import { eq } from 'drizzle-orm';

export async function load(event) {
	const keys = await db.select().from(apikey).where(eq(apikey.userId, event.locals.user.id))
	const keyStrings = keys.map(k => k.key);
	return {
 		user: event.locals.user, APIKeys: keyStrings
	};
}

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/auth');
	},
	newAPIKey: async (event) => {
		const user = event.locals.user;
		const data = await auth.api.createApiKey({
			body: {
				name: `${user.name}_API_KEY`,
				expiresIn: Number(env.API_KEY_EXPIRE),
				userId: user.id,
				prefix: 'APIKEY',
				remaining: 100,
				refillAmount: 100, 
				refillInterval: 1000,
				rateLimitTimeWindow: 1000,
				rateLimitMax: 100,
				rateLimitEnabled: true,
			},
		});
		return {
			success: true,
			apiKey: data.key
		};
	}
};
