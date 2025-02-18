"use server";

import { ActionResult } from "@/components/form";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { verifyEmailInput } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function register(prevState: ActionResult, formData: FormData) {
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

	try {
		await auth.api.signUpEmail({
			body: {
				email: email.toString(),
				name: name.toString(),
				username: username.toString(),
				password: password
			}
		})
	} catch (err) {
		return {
			error: true,
			// @ts-expect-error - body is not defined in the type
			message: err?.body?.message || "An unexpected error occurred."
		};
	}

	return redirect("/dashboard");
}