import db from "@/lib/db";
import { IncidentWithReportsAndMonitors } from "@/types/incident";
import { IncidentReportStatus } from "@/types/incident-report";
import { sql } from "drizzle-orm";
import { Metadata } from "next";

import PandaStatusPageDesign from "@/designs/panda";
import SimpleStatusPageDesign from "@/designs/simple";
import StormtrooperStatusPageDesign from "@/designs/stormtrooper";

type Props = {
	params: Promise<{ domain: string }>;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function StatusPage({ params }: Props) {
	const domain = decodeURIComponent((await params).domain);

	const statusPage = await db.query.statusPages.findFirst({
		where: sql`(domain = ${domain} OR (root = true AND domain IS NULL))`,
		orderBy: sql`CASE WHEN domain = ${domain} THEN 0 ELSE 1 END`,
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		}
	});

	if (!statusPage || statusPage.enabled === false) {
		return (
			<>
				<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
					<div className="flex flex-col items-center gap-3">
						<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
							(￣▽￣*)ゞ
						</h1>
						<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
							This is awkward...
						</h1>
						<p>
							A status page hasn&apos;t been set up yet or has been disabled for the time being. Please
							check back later.
						</p>
					</div>
				</main>
			</>
		)
	}

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

	return (
		<>
			{statusPage.design === "simple" && (
				<SimpleStatusPageDesign page={statusPage} incidents={incids} />
			)}
			{statusPage.design === "panda" && (
				<PandaStatusPageDesign page={statusPage} incidents={incids} />
			)}
			{statusPage.design === "stormtrooper" && (
				<StormtrooperStatusPageDesign page={statusPage} incidents={incids} />
			)}
		</>
	)
}