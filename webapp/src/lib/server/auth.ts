import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { apiKey } from "better-auth/plugins";

// No sign up, user are created in different workflow
export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'mysql' }),
	emailAndPassword: { 
		enabled: true, 
		disableSignUp: true 
	},
	plugins: [
		apiKey(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});