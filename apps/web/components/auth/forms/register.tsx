"use client";

import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { getFreshStatus, register } from "@/components/auth/actions";
import { Label } from "@/components/ui/label";

export default function RegisterForm({ inviteToken, onboarding = false }: { inviteToken: string | null, onboarding?: boolean }) {
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
			<InnerForm inviteToken={inviteToken} onboarding={onboarding} />
		</form>
	);
}

function InnerForm({ inviteToken, onboarding }: { inviteToken: string | null, onboarding?: boolean }) {
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
			<input id="onboarding" name="onboarding" type="hidden" value={onboarding ? "true" : "false"} />
			<div className="grid gap-6 w-full">
				<div className="grid gap-2">
					<Label htmlFor="name">
						Name
					</Label>
					<Input
						id="name"
						name="name"
						placeholder="Tim Cook"
						type="text"
						autoComplete="name"
						disabled={pending}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="email">
						Email
					</Label>
					<Input
						id="email"
						name="email"
						placeholder="tim@apple.com"
						type="email"
						autoComplete="email"
						disabled={pending}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="username">
						Username
					</Label>
					<Input
						id="username"
						name="username"
						placeholder="tim.cook"
						type="text"
						autoComplete="username"
						disabled={pending}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password">
						Password
					</Label>
					<div className="flex w-full flex-row items-center gap-2">
						<Input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••••••"
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
				</div>
				<div className="grid gap-2">
					<Label htmlFor="passwordConfirm">
						Confirm Password
					</Label>
					<Input
						id="passwordConfirm"
						name="passwordConfirm"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••••••"
						autoComplete="new-password"
						disabled={pending}
					/>
				</div>
				{!fresh && (
					<div className="grid gap-2">
						<Label htmlFor="inviteToken">
							Invite Token
						</Label>
						<Input
							id="inviteToken"
							name="inviteToken"
							placeholder="abc123"
							defaultValue={inviteToken ?? undefined}
							disabled={pending}
						/>
					</div>
				)}
				<Button
					type="submit"
					className="w-full data-[loading=true]:cursor-not-allowed"
					disabled={pending}
					data-loading={pending}
				>
					{pending ? <Spinner size={16} /> : "Submit"}
				</Button>
			</div>
		</>
	);
}
