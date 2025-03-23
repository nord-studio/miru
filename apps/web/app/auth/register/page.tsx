import RegisterForm from "@/components/auth/forms/register";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ inviteToken: string }> }) {
	const { inviteToken } = await searchParams;

	return (
		<>
			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px]">
				<div className="flex flex-col items-center justify-center gap-6 text-center">
					<div className="flex w-full flex-col items-center justify-center gap-2">
						<h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
							Create an Miru account
						</h1>
						<p className="text-sm text-neutral-500 sm:text-base">
							Fill out your details below to get started.
						</p>
					</div>
					<div className="flex w-full flex-col items-center justify-center gap-4">
						<RegisterForm inviteToken={inviteToken} />
					</div>
					<hr className="w-full border border-black/10 dark:border-white/10" />
					<div className="flex w-full flex-col items-center">
						<span>
							Already have an account?{" "}
							<Link href="/auth/login">
								<Button
									variant={"link"}
									className="p-0 text-blue-500 dark:text-blue-500"
								>
									Sign in
								</Button>
							</Link>
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
