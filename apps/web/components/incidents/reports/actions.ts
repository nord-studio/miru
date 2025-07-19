"use server";

import db from "@/lib/db";
import { incidentReports, incidents } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { IncidentReport, IncidentReportStatus } from "@miru/types";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/// The latest report is always the first in the array.
export const getIncidentWithReports = actionClient.inputSchema(z.string().nonempty()).action(async ({ parsedInput: id }) => {
	const incident = await db
		.select()
		.from(incidents)
		.where(eq(incidents.id, id))
		.limit(1)
		.then((res) => res[0]);

	if (!incident) {
		return { error: true, message: "Incidents not found" };
	}

	const reports: IncidentReport[] = await db.query.incidentReports.findMany({
		with: {
			incidentId: true
		},
		where: (reports, { eq }) => (eq(reports.incidentId, id)),
		orderBy: (reports, { desc }) => (desc(reports.timestamp)),
	}).then((res) => res.map((r) => ({
		id: r.id,
		incidentId: r.incidentId.id, // Map incidentId to incident_id
		status: r.status as IncidentReportStatus,
		message: r.message,
		timestamp: r.timestamp,
	})));

	return { incident, reports };
});

export const createIncidentReport = actionClient
	.inputSchema(
		z.object({
			incidentId: z.string().nonempty(),
			status: z.string().nonempty(),
			message: z.string().nonempty(),
		}),
		{
			handleValidationErrorsShape: async (ve) =>
				flattenValidationErrors(ve).fieldErrors,
		}
	)
	.outputSchema(
		z.object({
			error: z.boolean(),
			message: z.string(),
			report: z.custom<IncidentReport>().nullish(),
		})
	)
	.action(async ({ parsedInput: { incidentId, status, message } }) => {
		const incident = await db.query.incidents.findFirst({
			where: () => eq(incidents.id, incidentId)
		});

		const sta = status as IncidentReportStatus;

		if (sta === IncidentReportStatus.IDENTIFIED && !incident?.acknowledgedAt) {
			await db.update(incidents).set({
				acknowledgedAt: new Date(),
			}).where(eq(incidents.id, incidentId));
		}

		if (sta === IncidentReportStatus.RESOLVED && !incident?.resolvedAt) {
			await db.update(incidents).set({
				resolvedAt: new Date(),
			}).where(eq(incidents.id, incidentId));
		}

		const report = await db.insert(incidentReports).values({
			id: generateId(),
			incidentId,
			status: sta,
			message,
		}).returning().then((res) => res[0])

		if (!report) {
			return { error: true, message: "Failed to create report." };
		}

		revalidatePath("/admin/[workspaceSlug]/incidents/[id]", "layout");
		return {
			error: false,
			message: "Report created successfully",
			report: {
				...report,
				status: report.status as IncidentReportStatus,
			}
		};
	});

export const deleteIncidentReport = actionClient
	.inputSchema(z.object({
		id: z.string().nonempty(),
		incidentId: z.string().nonempty(),
	}), {
		handleValidationErrorsShape: async (ve) =>
			flattenValidationErrors(ve).fieldErrors,
	})
	.outputSchema(
		z.object({
			error: z.boolean(),
			message: z.string(),
		})
	)
	.action(async ({ parsedInput: { id, incidentId } }) => {
		const reports: IncidentReport[] = await db.query.incidentReports.findMany({
			with: {
				incidentId: true
			},
			where: (reports, { eq }) => (eq(reports.incidentId, incidentId))
		}).then((res) => res.map((r) => ({
			id: r.id,
			incidentId: r.incidentId, // Map incidentId to incident_id
			status: r.status as IncidentReportStatus,
			message: r.message,
			timestamp: r.timestamp,
		})));

		if (reports.length <= 1) {
			return { error: true, message: "Cannot delete the last report." };
		}

		const incident = await db.query.incidents.findFirst({
			where: () => eq(incidents.id, incidentId),
		});

		if (!incident) {
			return { error: true, message: "Incident not found." };
		}

		if (incident.resolvedAt) {
			return { error: true, message: "Cannot delete a report after the incident has been resolved." };
		}

		const report = await db
			.delete(incidentReports)
			.where(eq(incidentReports.id, id))
			.returning()
			.then((res) => res[0]);

		if (!report) {
			return { error: true, message: "Failed to delete report." };
		}

		revalidatePath("/admin/[workspaceSlug]/incidents/[id]", "layout");
		return { error: false, message: "Report deleted successfully" };
	});

export const editIncidentReport = actionClient
	.inputSchema(
		z.object({
			id: z.string().nonempty(),
			status: z.string().nonempty(),
			message: z.string().nonempty(),
		}),
		{ handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }
	)
	.outputSchema(
		z.object({
			error: z.boolean(),
			message: z.string(),
			report: z.custom<IncidentReport>().nullish(),
		})
	)
	.action(async ({ parsedInput: { id, status, message } }) => {
		const report = await db
			.update(incidentReports)
			.set({
				status: status as IncidentReportStatus,
				message,
			})
			.where(eq(incidentReports.id, id))
			.returning()
			.then((res) => res[0]);

		if (!report) {
			return { error: true, message: "Failed to update report." };
		}

		revalidatePath("/admin/[workspaceSlug]/incidents/[id]", "layout");
		return {
			error: false, message: "Report updated successfully", report: {
				...report,
				status: report.status as IncidentReportStatus,
			}
		};
	});
