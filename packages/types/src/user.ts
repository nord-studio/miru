export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	image?: string | null | undefined | undefined;
	username?: string | null | undefined;
	displayUsername?: string | null | undefined;
}