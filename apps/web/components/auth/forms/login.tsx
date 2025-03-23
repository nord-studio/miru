import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { logIn } from "@/components/auth/actions";

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

	const [showPassword, setShowPassword] = React.useState(false);
	const togglePassword = () => setShowPassword((prev) => !prev);
	return (
		<>
			<input type="hidden" name="redirect" id="redirect" value={redirect ?? "/admin"} />
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="Email"
				required
				disabled={pending}
			/>
			<div className="flex w-full flex-row items-center gap-2">
				<Input
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					placeholder="Password"
					required
					disabled={pending}
				/>
				<Button
					variant="outline"
					size="icon"
					className="p-2"
					onClick={togglePassword}
					type="button"
					disabled={pending}
				>
					{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
				</Button>
			</div>
			<Button className="w-full" disabled={pending} type="submit">
				{pending ? <Spinner size={16} /> : "Submit"}
			</Button>
		</>
	);
}
