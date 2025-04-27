import type { Metadata } from 'next/types';

export function createMetadata(override: Metadata): Metadata {
	return {
		...override,
		// openGraph: {
		// 	title: override.title ?? undefined,
		// 	description: override.description ?? undefined,
		// 	url: 'https://miru.nordstud.io',
		// 	images: '/banner.png',
		// 	siteName: 'Miru',
		// 	...override.openGraph,
		// },
		icons: {
			icon: '/icon.svg',
		},
	};
}

export const baseUrl =
	process.env.NODE_ENV === 'development'
		? new URL('http://localhost:3000')
		: new URL(`https://miru.nordstud.io`);