export interface ApiKey {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	expiresAt: Date | null;
	workspaceId: string;
	permissions: ApiKeyPermissions;
}

export interface ApiKeyPermissions {
	monitors: ("create" | "read" | "update" | "delete")[];
	incidents: ("create" | "read" | "update" | "delete")[];
	pages: ("create" | "read" | "update" | "delete")[];
}