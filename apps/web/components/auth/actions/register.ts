"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { workspaceMembers, workspaces } from "@/lib/db/schema/workspaces";
import { verifyEmailInput } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function register(prevState: { error: boolean, message: string }, formData: FormData) {
	"use server";
	const fresh = await db.select().from(user).limit(1).then((res) => res.length === 0);
	if (!fresh) {
		return {
			error: true,
			message: "You have already registered an account. Please sign in."
		};
	}

	const name = formData.get("name");
	if (typeof name !== "string" || name.length < 2 || name.length > 32) {
		return {
			error: true,
			message: "Please enter a valid name between 2 and 32."
		};
	}

	const username = formData.get("username");
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 24 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return {
			error: true,
			message: "Please enter a valid username between 3 and 24 characters."
		};
	}

	const email = formData.get("email");
	if (typeof email !== "string" || !verifyEmailInput(email.toString())) {
		return {
			error: true,
			message: "Please enter a valid email."
		};
	}

	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 8 || password.length > 255) {
		return {
			error: true,
			message: "Please enter a valid password between 8 and 255 characters long."
		};
	}

	const passwordConfirm = formData.get("passwordConfirm");
	if (password !== passwordConfirm) {
		return {
			error: true,
			message: "Passwords do not match."
		};
	}

	const userResponse = await auth.api.signUpEmail({
		body: {
			email: email.toString(),
			name: name.toString(),
			username: username.toString(),
			password: password
		}
	}).then((res) => {
		return res.user;
	}).catch((err) => {
		return {
			error: true,
			message: err?.body?.message || "An unexpected error occurred."
		}
	});

	if ('error' in userResponse) {
		return userResponse;
	}
	const userData = userResponse;

	// Create a default workspace for the user
	const workspace = await db.insert(workspaces).values({
		name: "Default Workspace",
		slug: "default-workspace"
	}).returning();

	if (!workspace) {
		return {
			error: true,
			message: "Failed to create a workspace."
		};
	}

	console.log(userData.id)

	// Add the user to the workspace
	await db.insert(workspaceMembers).values({
		workspaceId: workspace[0].id,
		userId: userData.id,
		role: "owner",
	});

	return redirect("/admin/default-workspace");
}