import RegisterForm from "@/components/auth/forms/register";
import Link from "next/link";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ inviteToken: string }> }) {
	const { inviteToken } = await searchParams;

	return (
		<>
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="flex w-full max-w-sm flex-col gap-6">
					<div className="flex flex-col gap-6">
						<Card>
							<CardHeader className="text-center">
								<CardTitle className="text-xl">Hello there!</CardTitle>
								<CardDescription>
									Fill out your details below to get started.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-6">
									<RegisterForm inviteToken={inviteToken} />
									<div className="text-center text-sm">
										Already have an account?{" "}
										<Link href="/auth/login" className="underline underline-offset-4">
											Sign in.
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
