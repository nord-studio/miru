"use client";

import LoginForm from "@/components/auth/forms/login";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function LoginPage() {
	const searchParams = useSearchParams();

	const redirect = searchParams.get("redirect");

	return (
		<>
			<div className="absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 sm:w-1/2 md:w-auto">
				<div className="flex flex-col items-center justify-center gap-6 text-center">
					<div className="flex w-full flex-col items-center justify-center gap-2">
						<h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
							Sign in to Miru
						</h1>
						<p className="text-sm text-neutral-500 sm:text-base">
							Please log in with your Miru account to continue.
						</p>
					</div>
					<div className="flex w-full flex-col items-center justify-center gap-4">
						{/* <OAuthProviders />
						<div className="w-full py-2 flex items-center">
							<hr className="w-full border-t border-black/10 dark:border-white/10" />
						</div> */}
						<LoginForm redirect={redirect} />
					</div>
					<hr className="w-full border border-black/10 dark:border-white/10" />
					<div className="flex w-full flex-col items-center">
						<span>
							Forgot password?{" "}
							<Link href="/auth/reset">
								<Button
									variant={"link"}
									className="p-0 text-blue-500 dark:text-blue-500"
								>
									Well, that sucks.
								</Button>
							</Link>
						</span>
						<span>
							Don&apos;t have an account?{" "}
							<Link href="/auth/register">
								<Button
									variant={"link"}
									className="p-0 text-blue-500 dark:text-blue-500"
								>
									Create one.
								</Button>
							</Link>
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
