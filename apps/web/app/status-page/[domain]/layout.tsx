import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
	const domain = decodeURIComponent((await params).domain);

	const statusPage = await db.query.statusPages.findFirst({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		},
		where: sql`(domain = ${domain} OR (root = true AND domain IS NULL))`,
		orderBy: sql`CASE WHEN domain = ${domain} THEN 0 ELSE 1 END`,
	});

	const appDomain = process.env.APP_DOMAIN || "localhost:3000";
	const secure = process.env.APP_ENV === "development" ? "http" : "https";
	const appUrl = `${secure}://${appDomain}`;
	const favicon = `${appUrl}/api/assets/${statusPage?.favicon}`;

	if (!statusPage || statusPage.enabled === false) {
		return {
			title: "Miru",
			description: "A free, open-source and self hostable status and monitoring service.",
		}
	} else {
		return {
			title: `${statusPage.name} Status`,
			description: statusPage.description ?? `Welcome to ${statusPage.name}'s status page. Real-time and historical data on system performance.`,
			icons: [
				{ rel: "icon", url: statusPage.favicon ? favicon : `${appUrl}/favicon.ico`, sizes: "32x32", type: "image/vnd.microsoft.icon" },
			]
		}
	}
}

export default async function StatusPageRootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ domain: string }> }) {
	const appDomain = process.env.APP_DOMAIN ?? "localhost:3000";
	const domain = decodeURIComponent((await params).domain);
	const root = domain === appDomain;

	if (root) {
		const fresh = await db
			.select()
			.from(user)
			.limit(1)
			.then((res) => res.length === 0);

		if (fresh) {
			// TODO: Redirect to onboarding
			return (
				<>
					<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
						<div className="flex flex-col items-center">
							<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
								Welcome to Miru!
							</h1>
							<p>
								It looks like you haven&apos;t setup Miru yet. Click
								the button below to get started.
							</p>
						</div>
						<Link href="/auth/register">
							<Button>Create Account</Button>
						</Link>
					</main>
				</>
			)
		}
	}

	return (
		<>
			{children}
		</>
	)
}