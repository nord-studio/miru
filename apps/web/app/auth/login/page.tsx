"use client"

import LoginForm from "@/components/auth/forms/login";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function LoginPage() {
	const searchParams = useSearchParams();

	const redirect = searchParams.get("redirect");

	return (
		<>
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="flex w-full max-w-sm flex-col gap-6">
					<div className="flex flex-col gap-6">
						<Card>
							<CardHeader className="text-center">
								<CardTitle className="text-xl">Welcome back</CardTitle>
								<CardDescription>
									Log in to your Miru account to continue.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-6">
									<LoginForm redirect={redirect} />
									<div className="text-center text-sm">
										Don&apos;t have an account?{" "}
										<Link href="/auth/register" className="underline underline-offset-4">
											Create one.
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
