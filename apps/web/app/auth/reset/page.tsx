import {
	RequestPasswordResetForm,
	ResetPasswordForm,
} from "@/components/auth/forms/reset";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ token: string | null; error: string | null }>;
}) {
	const { token, error } = await searchParams;
	if (error) {
		return (
			<div className="flex flex-col gap-4 items-center w-full h-screen justify-center">
				<div className="text-center">
					<h1 className="text-3xl font-bold">
						Something went wrong!
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						{error}
					</p>
				</div>
				<Link href="/auth/reset">
					<Button>Go Back</Button>
				</Link>
			</div>
		);
	}
	return (
		<>
			{!token ? (
				<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
					<div className="flex w-full max-w-sm flex-col gap-6">
						<div className="flex flex-col gap-6">
							<Card>
								<CardHeader className="text-center">
									<CardTitle className="text-xl">Reset Password</CardTitle>
									<CardDescription>
										Don&apos;t worry, it happens to the best of us.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6">
										<RequestPasswordResetForm />
										<div className="text-center text-sm">
											Suddenly had an epiphany?{" "}
											<Link href="/auth/login" className="underline underline-offset-4">
												Log in
											</Link>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			) : (
				<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
					<div className="flex w-full max-w-sm flex-col gap-6">
						<div className="flex flex-col gap-6">
							<Card>
								<CardHeader className="text-center">
									<CardTitle className="text-xl">Reset Password</CardTitle>
									<CardDescription>
										Please set a new password for your account.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6">
										<ResetPasswordForm token={token} />
										<div className="text-center text-sm">
											Suddenly had an epiphany?{" "}
											<Link href="/auth/login" className="underline underline-offset-4">
												Log in
											</Link>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
