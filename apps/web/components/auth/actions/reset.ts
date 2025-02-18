import { auth } from "@/lib/auth";
import { verifyEmailInput } from "@/lib/utils";
import { ActionResult } from "next/dist/server/app-render/types";

const requestResetPassword = async (prevState: ActionResult, formData: FormData) => {
	"use server";

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

export { requestResetPassword };