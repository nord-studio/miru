import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { statusPages } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import SimpleStatusPageDesign from "@/designs/simple";
import PandaStatusPageDesign from "@/designs/panda";
import StormtrooperStatusPageDesign from "@/designs/stormtrooper";
import { IncidentReportStatus } from "@/types/incident-report";
import { IncidentWithReportsAndMonitors } from "@/types/incident";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
	const statusPage = await db.query.statusPages.findFirst({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(statusPages.root, true)
	});

	if (!statusPage) {
		return {
			title: "Miru",
			description: "A free, open-source and self hostable status and monitoring service.",
		}
	} else {
		return {
			title: `${statusPage.name} Status`,
			description: statusPage.description ?? `Welcome to ${statusPage.name}'s status page. Real-time and historical data on system performance.`,
		}
	}
}

export default async function Home() {
	const fresh = await db
		.select()
		.from(user)
		.limit(1)
		.then((res) => res.length === 0);

	if (fresh) {
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
					<Link href="/auth/register?fresh=true">
						<Button>Create Account</Button>
					</Link>
				</main>
			</>
		)
	}

	const statusPage = await db.query.statusPages.findFirst({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(statusPages.root, true)
	});

	// Get all incidents from the last 45 days
	const incids: IncidentWithReportsAndMonitors[] = await db.query.incidents.findMany({
		where: () => sql`started_at > NOW() - INTERVAL '45 days'`,
		with: {
			monitorsToIncidents: {
				with: {
					monitor: true
				}
			},
			reports: true
		}
	}).then((incidents) => {
		return incidents.map((incident) => {
			return {
				...incident,
				monitorsToIncidents: incident.monitorsToIncidents.map((mti) => {
					return {
						monitor: mti.monitor,
					}
				}),
				reports: incident.reports.map((report) => {
					return {
						...report,
						status: report.status as IncidentReportStatus,
					}
				})
			}
		})
	});

	if (!statusPage) {
		return (
			<>
				<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
					<div className="flex flex-col items-center">
						<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
							This is awkward...
						</h1>
						<p>
							A status page hasn&apos;t been setup yet. Please
							check back later.
						</p>
					</div>
				</main>
			</>
		)
	}

	return (
		<>
			{statusPage.design === "simple" && (
				<SimpleStatusPageDesign page={statusPage} incidents={incids} />
			)}
			{statusPage.design === "panda" && (
				<PandaStatusPageDesign page={statusPage} />
			)}
			{statusPage.design === "stormtrooper" && (
				<StormtrooperStatusPageDesign page={statusPage} />
			)}
		</>
	)
}
