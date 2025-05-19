import { User } from "./user";

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

export enum RankedRoles {
	owner = 3,
	admin = 2,
	member = 1,
}

export interface WorkspaceMemberWithUser extends WorkspaceMember {
	user: User;
}

export interface WorkspaceWithMembers extends WorkspaceMember {
	workspace: Workspace;
	user: User;
}