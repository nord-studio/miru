import {
	RequestPasswordResetForm,
	ResetPasswordForm,
} from "@/components/auth/forms/reset";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
				<div className="absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 sm:w-1/2 md:w-auto">
					<div className="flex flex-col items-center justify-center gap-6 text-center">
						<div className="flex w-full flex-col items-center justify-center gap-2">
							<h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
								Reset Password
							</h1>
							<p className="text-sm text-neutral-500 sm:text-base">
								Please enter your email to recieve a password
								request.
							</p>
						</div>
						<div className="flex w-full flex-col items-center justify-center gap-4">
							<RequestPasswordResetForm />
						</div>
						<hr className="w-full border border-black/10 dark:border-white/10" />
						<div className="flex w-full flex-col items-center">
							<span>
								Suddenly had an epiphany?{" "}
								<Link href="/auth/login">
									<Button
										variant={"link"}
										className="p-0 text-blue-500 dark:text-blue-500"
									>
										Login
									</Button>
								</Link>
							</span>
						</div>
					</div>
				</div>
			) : (
				<div className="absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 sm:w-1/2 md:w-auto">
					<div className="flex flex-col items-center justify-center gap-6 text-center">
						<div className="flex w-full flex-col items-center justify-center gap-2">
							<h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
								Set a New Password
							</h1>
							<p className="text-sm text-neutral-500 sm:text-base">
								Please set a new password for your accoumt. Make
								sure it&apos;s secure!
							</p>
						</div>
						<div className="flex w-full flex-col items-center justify-center gap-4">
							<ResetPasswordForm token={token} />
						</div>
						<hr className="w-full border border-black/10 dark:border-white/10" />
						<div className="flex w-full flex-col items-center">
							<span>
								Suddenly had an epiphany?{" "}
								<Link href="/auth/login">
									<Button
										variant={"link"}
										className="p-0 text-blue-500 dark:text-blue-500"
									>
										Login
									</Button>
								</Link>
							</span>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
