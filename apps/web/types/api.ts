export interface ApiKey {
	workspaceId: string;
	name: string;
	id: string;
	createdAt: Date;
	updatedAt: Date;
	expiresAt: Date | null;
	permissions: ApiKeyPermissions;
};

export interface ApiKeyPermissions {
	monitors: ("create" | "read" | "update" | "delete")[];
	incidents: ("create" | "read" | "update" | "delete")[];
	pages: ("create" | "read" | "update" | "delete")[];
}