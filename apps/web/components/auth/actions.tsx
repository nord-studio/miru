"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { user, workspaceInvites, workspaceMembers, workspaces } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { verifyEmailInput } from "@/lib/utils";
import { ActionResult } from "@/types/form";
import { render } from "@react-email/render";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { cache } from "react";
import { z } from "zod";
import VerifyAccountEmail from "@miru/transactional/emails/verify-account";
import ResetPasswordEmail from "@miru/transactional/emails/reset-password";

export async function logIn(prevState: ActionResult, formData: FormData) {
	const email = formData.get("email");
	if (!email || !verifyEmailInput(email.toString())) {
		return {
			error: true,
			message: "Invalid email or password"
		};
	}

	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: true,
			message: "Invalid email or password"
		};
	}

	try {
		await auth.api.signInEmail({
			body: {
				email: email.toString(),
				password: password
			}
		});
	} catch (err) {
		console.error(err);
		return {
			error: true,
			message: "Something went wrong while logging in."
		};
	}

	const redir = formData.get("redirect");
	if (typeof redir === "string") {
		return redirect(redir);
	} else {
		return redirect("/admin");
	}
}

export async function logOut() {
	await auth.api.signOut({ headers: await headers() });
	return redirect("/auth/login");
}

export async function getFreshStatus() {
	"use server";
	const fresh = await db.select().from(user).limit(1).then((res) => res.length === 0);
	return fresh;
}

export async function register(prevState: { error: boolean, message: string }, formData: FormData) {
	const fresh = await db.select().from(user).limit(1).then((res) => res.length === 0);

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

	const onboarding = formData.get("onboarding") ?? "false" as string;
	const onboardingBool = onboarding === "true" ? true : false;

	if (!fresh) {
		const inviteToken = formData.get("inviteToken");
		if (typeof inviteToken !== "string" || inviteToken.length < 1 || inviteToken.length > 255) {
			return {
				error: true,
				message: "Please enter a valid invite code."
			};
		}

		const invite = await db.select().from(workspaceInvites).where(eq(workspaceInvites.id, inviteToken)).limit(1);

		if (!invite) {
			return {
				error: true,
				message: "Invalid invite code."
			}
		};

		if (new Date(invite[0].validUntil) < new Date()) {
			return {
				error: true,
				message: "Invite code has expired. Please request a new one."
			}
		};
	}

	const userResponse = await auth.api.signUpEmail({
		body: {
			email: email.toString(),
			name: name.toString(),
			username: username.toString(),
			password: password,
			admin: fresh
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

	if (!fresh) {
		const inviteToken = formData.get("inviteToken") as string;
		const invite = await db.select().from(workspaceInvites).where(eq(workspaceInvites.id, inviteToken)).limit(1).then((res) => res[0]);
		const workspace = await db.select().from(workspaces).where(eq(workspaces.id, invite.workspaceId)).limit(1).then((res) => res[0]);

		await db.delete(workspaceInvites).where(eq(workspaceInvites.id, inviteToken));

		await db.insert(workspaceMembers).values({
			workspaceId: workspace.id,
			userId: userData.id,
			role: invite.role,
		});

		return redirect(`/admin/${workspace.slug}`);
	} else {
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

		// Add the user to the workspace
		await db.insert(workspaceMembers).values({
			workspaceId: workspace[0].id,
			userId: userData.id,
			role: "owner",
		});

		if (onboardingBool) {
			return redirect(`/onboarding/workspace`);
		} else {
			return redirect("/admin/default-workspace");
		}
	}
}

export async function requestResetPassword(prevState: ActionResult, formData: FormData) {
	const email = formData.get("email");
	if (!email || !verifyEmailInput(email.toString())) {
		return {
			error: true,
			message: "Invalid email"
		};
	};

	await auth.api.forgetPassword({
		body: {
			email: email.toString(),
		},
	})
}

export async function sendResetPasswordEmail(
	email: string,
	url: string
) {
	const { config } = await import("@/lib/config").then((res) => res.getConfig());
	if (!config.email.enabled) {
		console.error(
			"Emails are not enabled on this instance. Learn more: https://miru.nordstud.io/docs/configuration/email"
		);
		return;
	}

	const userEmail = await db
		.select()
		.from(user)
		.where(eq(user.email, email))
		.then((rows) => rows[0]);

	if (!userEmail) {
		// We do not tell the user if the email is invalid to prevent email enumeration
		return;
	}

	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		secure: process.env.SMTP_SECURE === 'true',
		port: Number(process.env.SMTP_PORT),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
		debug: process.env.APP_ENV === "development",
	} as SMTPTransport.Options);

	const body = await render(<ResetPasswordEmail url={url} />);

	await transporter
		.sendMail({
			from: process.env.SMTP_FROM,
			to: email,
			subject: "Password Reset Request",
			html: body,
		})
		.catch((err) => {
			console.error(err);
		});
}

export const getCurrentUser = cache(async () => {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	return currentUser;
})

export const updatePassword = actionClient.schema(z.object({
	id: z.string(),
	password: z.string().min(8).max(255),
	passwordConfirm: z.string().min(8).max(255),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string()
})).action(async ({ parsedInput: { id, password, passwordConfirm } }) => {
	if (password !== passwordConfirm) {
		return {
			error: true,
			message: "Passwords do not match."
		}
	}

	const currentUser = await db.query.user.findFirst({
		where: () => eq(user.id, id),
	});

	if (!currentUser) {
		return {
			error: true,
			message: "Unauthorized"
		}
	}

	const ctx = await auth.$context;

	const hash = await ctx.password.hash(password);

	await ctx.internalAdapter.updatePassword(currentUser.id, hash);

	return {
		error: false,
		message: "Password updated successfully."
	}
});

export async function sendEmailVerification(
	email: string,
	url: string,
) {
	const { config } = await import("@/lib/config").then((res) => res.getConfig());
	if (!config.email.enabled) {
		console.error(
			"Emails are not enabled on this instance. Learn more: https://miru.nordstud.io/docs/configuration#enable-email"
		);
		return;
	}

	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		secure: process.env.SMTP_SECURE === "true",
		port: Number(process.env.SMTP_PORT),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
		debug: process.env.APP_ENV === "development",
	} as SMTPTransport.Options);

	const body = await render(<VerifyAccountEmail url={url} />);

	await transporter
		.sendMail({
			from: process.env.SMTP_FROM,
			to: email,
			subject: "Password Reset Request",
			html: body,
		})
		.catch((err) => {
			console.error(err);
		});
}