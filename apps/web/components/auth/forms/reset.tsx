"use client";

import { Input } from "@/components/ui/input";
import React from "react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Label } from "@/components/ui/label";

export function RequestPasswordResetForm() {
	const [loading, setLoading] = React.useState(false);
	const [email, setEmail] = React.useState("");

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setLoading(true);
		const { error } = await authClient.forgetPassword({
			email,
			redirectTo: "/auth/reset",
		});

		if (error) {
			console.error(error);
			toast.error("Error!", {
				description: "An error occurred. Please try again later.",
			});
			setLoading(false);
		}

		setLoading(false);
		toast.success("Success!", {
			description: "Check your email for a password reset link.",
		});
	};

	return (
		<>
			<form
				className="flex flex-col gap-4 max-w-md w-full"
				onSubmit={(e) => onSubmit(e)}
			>
				<div className="grid gap-2">
					<Label htmlFor="email">
						Email
					</Label>
					<Input
						type="email"
						placeholder="tim@apple.com"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
				</div>
				<Button className="w-full" disabled={loading} type="submit">
					{loading ? <Spinner size={16} /> : "Submit"}
				</Button>
			</form>
		</>
	);
}

export function ResetPasswordForm({ token }: { token: string }) {
	const [loading, setLoading] = React.useState(false);
	const [password, setPassword] = React.useState("");
	const [passwordConfirm, setPasswordConfirm] = React.useState("");
	const router = useRouter();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password || !passwordConfirm || !token) return;
		if (password !== passwordConfirm) {
			toast.error("Something went wrong!", {
				description: "Passwords do not match.",
			});
			return;
		}

		setLoading(true);

		const { error } = await authClient.resetPassword({
			newPassword: password,
			token,
		});

		if (error) {
			toast.error("Error!", {
				description: error.message,
			});
			setLoading(false);
			return;
		}

		setLoading(false);
		toast.success("Success!", {
			description: "Your password has been changed.",
		});

		router.push("/auth/login");
	};
	return (
		<>
			<form
				className="flex flex-col gap-6 max-w-md w-full"
				onSubmit={(e) => onSubmit(e)}
			>
				<div className="grid gap-2">
					<Label htmlFor="password">
						New Password
					</Label>
					<Input
						type="password"
						name="password"
						placeholder="••••••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="passwordConfirm">
						Confirm New Password
					</Label>
					<Input
						type="password"
						name="passwordConfirm"
						placeholder="••••••••••••"
						value={passwordConfirm}
						onChange={(e) => setPasswordConfirm(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<Button type="submit" disabled={loading}>
					{loading ? <Spinner size={16} /> : "Submit"}
				</Button>
			</form>
		</>
	);
}
