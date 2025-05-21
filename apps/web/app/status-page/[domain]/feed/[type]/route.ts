import db from "@/lib/db";
import { getAppUrl } from "@/lib/utils";
import { IncidentWithReportsAndMonitors } from "@/types/incident";
import { IncidentReportStatus } from "@/types/incident-report";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Feed } from "feed";
import { getReportStatusLabel } from "@/components/incidents/utils";

export const revalidate = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ domain: string; type: string }> }) {
	const { domain: spDomain, type } = await params;
	if (!["rss", "atom"].includes(type)) return notFound();

	const domain = decodeURIComponent(spDomain);

	const statusPage = await db.query.statusPages.findFirst({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true,
				},
			},
		},
		where: sql`(domain = ${domain} OR (root = true AND domain IS NULL))`,
		orderBy: sql`CASE WHEN domain = ${domain} THEN 0 ELSE 1 END`,
	});

	if (!statusPage || statusPage.enabled === false) return notFound();

	const { appUrl } = getAppUrl();
	const baseUrl = statusPage.root ? appUrl : statusPage.domain;

	const feed = new Feed({
		id: `${baseUrl}/feed/${type}`,
		title: statusPage.name,
		description: statusPage.description ? statusPage.description : `Welcome to ${statusPage.name}'s status page. Real-time and historical data on system performance.`,
		link: `${baseUrl}/feed/${type}`,
		generator: "Miru - miru.nordstud.io",
		feedLinks: {
			rss: `${baseUrl}/feed/rss`,
			atom: `${baseUrl}/feed/atom`,
		},
		author: {
			name: "Nord Studio",
			email: "hello@nordstud.io",
			link: "https://nordstud.io",
		},
		copyright: `Copyright ${new Date().getFullYear().toString()}, Nord Studio`,
		language: "en-US",
		updated: new Date(),
		ttl: 60
	});

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

	for (const incident of incids) {
		const url = `${baseUrl}/incidents/${incident.id}`
		const reports = incident.reports.map((report) => {
			const reportStatus = getReportStatusLabel(report);
			return `[${reportStatus}]: ${report.message}`
		}).join("\n\n")

		feed.addItem({
			id: incident.id,
			title: incident.title,
			link: url,
			description: reports,
			date: incident.resolvedAt ?? incident.startedAt ?? new Date()
		})
	}

	feed.items.sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

	const res = type === "rss" ? feed.rss2() : feed.atom1();

	return new Response(res, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		}
	});
}