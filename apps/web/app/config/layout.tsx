import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, unauthorized } from "next/navigation";

export default async function InstanceConfigLayout({ children }: { children: React.ReactNode }) {
	const data = await auth.api.getSession({
		headers: await headers()
	});

	if (!data || !data.user) {
		return redirect("/auth/login");
	}

	if (!data.user.admin) return unauthorized();

	return (
		<div className="flex flex-col w-full min-h-screen px-4 sm:px-6 py-4 max-w-[800px] mx-auto">
			{children}
		</div>
	)
}