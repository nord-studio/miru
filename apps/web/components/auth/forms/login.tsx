"use client"

import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { logIn } from "@/components/auth/actions";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginForm({ redirect }: { redirect?: string | null }) {
	const [state, formAction] = useActionState(logIn, {
		error: false,
		message: "",
	});

	return (
		<>
			<form className="flex flex-col gap-4 w-full" action={formAction}>
				{state.error && <p className="text-center">{state.message}</p>}
				{/* This is required to use the "useFormStatus" hook */}
				<Form redirect={redirect} />
			</form>
		</>
	);
}

function Form({ redirect }: { redirect?: string | null }) {
	const { pending } = useFormStatus();

	const [loading, setLoading] = React.useState(false);
	const [showPassword, setShowPassword] = React.useState(false);
	const togglePassword = () => setShowPassword((prev) => !prev);
	const router = useRouter();

	React.useEffect(() => {
		if (!PublicKeyCredential.isConditionalMediationAvailable ||
			!PublicKeyCredential.isConditionalMediationAvailable()) {
			return;
		}

		void authClient.signIn.passkey({ autoFill: true }).then((res) => {
			setLoading(true);
			if (res?.error) {
				// If the user cancels the authentication, don't show an error
				// Sometimes this happens with React strict mode too
				if (res.error.message === "auth cancelled") return;
				toast.error("Something went wrong!", {
					description: res.error.message
				})
			} else {
				router.push(redirect ?? "/admin");
			}
		}).finally(() => setLoading(false))
	}, [router, redirect]);

	return (
		<>
			<input type="hidden" name="redirect" id="redirect" value={redirect ?? "/admin"} />
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="Email"
				required
				disabled={pending || loading}
				autoComplete="email webauthn"
			/>
			<div className="flex w-full flex-row items-center gap-2">
				<Input
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					placeholder="Password"
					required
					disabled={pending || loading}
					autoComplete="current-password webauthn"
				/>
				<Button
					variant="outline"
					size="icon"
					className="p-2"
					onClick={togglePassword}
					type="button"
					disabled={pending || loading}
				>
					{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
				</Button>
			</div>
			<Button className="w-full" disabled={pending || loading} type="submit">
				{pending || loading ? <Spinner size={16} /> : "Submit"}
			</Button>
		</>
	);
}
