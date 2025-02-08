"use server";

import { ActionResult } from "@/components/form";
import { auth } from "@/lib/auth";
import { verifyEmailInput } from "@/lib/utils";
import { redirect } from "next/navigation";

const logIn = async (prevState: ActionResult, formData: FormData) => {
	"use server";

	const email = formData.get("email");
	if (!email || !verifyEmailInput(email.toString())) {
		return {
			error: true,
			message: "Invalid email"
		};
	}

	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: true,
			message: "Invalid password"
		};
	}

	try {
		await auth.api.signInEmail({
			body: {
				email: email.toString(),
				password: password
			}
		})
	} catch (err: any) {
		return {
			error: true,
			message: err.body.message
		};
	}

	return redirect("/dashboard");
}

export default logIn;