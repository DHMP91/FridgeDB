import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';


const protectedRoutes = ['/app', "/barcode"];
const protectedAPIRoutes = ["/api/scanner"];
const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// URL protected route
	const isProtected = protectedRoutes.some((route) => event.route.id?.startsWith(route));
	if (isProtected && !session) {
        throw redirect(303, '/better-auth/login');
    }

	// API protected route
	const isProtectedAPI = protectedAPIRoutes.some((route) => event.route.id?.startsWith(route));
	if (isProtectedAPI && !session){
		const apiKey = event.request.headers.get('x-api-key');
		const notAuthed = new Response('Not authenticated', { status: 401 });
		if( apiKey === null || apiKey === undefined ){
			return notAuthed
		}
		const data = await auth.api.verifyApiKey({
			body: {
				key: apiKey
			}
		});
		if( !data.valid ){
			return notAuthed
		}
	};
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
