import InstanceConfigForm from "@/app/config/form";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { unauthorized } from "next/navigation";

export default async function InstanceConfigPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorized();
	}

	const { config } = await getConfig();

	return (
		<>
			<main className="flex flex-col w-full gap-4">
				<div className="flex flex-row gap-2 items-center justify-between w-full">
					<Link href="/admin">
						<Button variant="link" className="has-[>svg]:px-0">
							<ArrowLeft /> Back to Admin
						</Button>
					</Link>
					<div className="hidden md:block">
						<ThemeDropdown />
					</div>
				</div>
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Instance Configuration
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Manage your entire Miru instance from here.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center" />
				</div>
				<InstanceConfigForm config={config} />
			</main>
		</>
	)
}