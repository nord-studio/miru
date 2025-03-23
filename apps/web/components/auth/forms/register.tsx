"use client";

import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { getFreshStatus, register } from "@/components/auth/actions";

export default function RegisterForm({ inviteToken }: { inviteToken: string | null }) {
	const [state, formAction] = useActionState(register, {
		error: false,
		message: "",
	});

	return (
		<form
			action={formAction}
			className="flex w-full flex-col items-center gap-4"
		>
			{state.error && <p className="text-center">{state.message}</p>}
			<InnerForm inviteToken={inviteToken} />
		</form>
	);
}

function InnerForm({ inviteToken }: { inviteToken: string | null }) {
	const [showPassword, setShowPassword] = React.useState(false);
	const [fresh, setFresh] = React.useState(false);

	React.useEffect(() => {
		getFreshStatus().then((res) => {
			setFresh(res);
		});
	}, []);

	const togglePassword = () => setShowPassword((prev) => !prev);

	const { pending } = useFormStatus();

	return (
		<>
			<Input
				id="name"
				name="name"
				placeholder="Name"
				type="text"
				autoComplete="name"
				disabled={pending}
			/>
			<Input
				id="email"
				name="email"
				placeholder="Email"
				type="email"
				autoComplete="email"
				disabled={pending}
			/>
			<Input
				id="username"
				name="username"
				placeholder="Username"
				type="text"
				autoComplete="username"
				disabled={pending}
			/>
			<div className="flex w-full flex-row items-center gap-2">
				<Input
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					placeholder="Password"
					autoComplete="new-password"
					disabled={pending}
				/>
				<Button
					variant="outline"
					size="icon"
					type="button"
					className="p-2"
					onClick={togglePassword}
					disabled={pending}
				>
					{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
				</Button>
			</div>
			<Input
				id="passwordConfirm"
				name="passwordConfirm"
				placeholder="Confirm Password"
				type={showPassword ? "text" : "password"}
				autoComplete="new-password"
				disabled={pending}
			/>
			{!fresh && (
				<Input
					id="inviteToken"
					name="inviteToken"
					defaultValue={inviteToken ?? undefined}
					placeholder="Invite Token"
					disabled={pending}
				/>
			)}
			<Button
				type="submit"
				className="w-full data-[loading=true]:cursor-not-allowed"
				disabled={pending}
				data-loading={pending}
			>
				{pending ? <Spinner size={16} /> : "Submit"}
			</Button>
		</>
	);
}
