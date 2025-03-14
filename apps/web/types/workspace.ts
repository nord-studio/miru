import { User } from "better-auth/types";

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkspaceMember {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	workspaceId: string;
	role: "owner" | "admin" | "member";
}

export interface WorkspaceWithMembers extends WorkspaceMember {
	workspace: Workspace;
	user: User;
}