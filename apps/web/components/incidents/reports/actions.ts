"use server";

import db from "@/lib/db";
import { incidentReports, incidents } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { IncidentReport, IncidentReportStatus } from "@/types/incident-report";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";

export const getIncidentWithReports = cache(actionClient.schema(z.string().nonempty()).action(async ({ parsedInput: id }) => {
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
		where: (reports, { eq }) => (eq(reports.incidentId, id))
	}).then((res) => res.map((r) => ({
		id: r.id,
		incident_id: r.incidentId.id, // Map incidentId to incident_id
		status: r.status as IncidentReportStatus,
		message: r.message,
		timestamp: r.timestamp,
	})));

	return { reports };
}));

export const createIncidentReport = actionClient
	.schema(
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
		})
	)
	.action(async ({ parsedInput: { incidentId, status, message } }) => {
		const report = await db.insert(incidentReports).values({
			id: generateId(),
			incidentId,
			status: status as IncidentReportStatus,
			message,
		});

		if (!report) {
			return { error: true, message: "Failed to create report." };
		}

		revalidatePath("/admin/[workspaceSlug]/incidents/[id]", "layout");
		return { error: false, message: "Report created successfully" };
	});

export const deleteIncidentReport = actionClient
	.schema(z.object({
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
			incident_id: r.incidentId.id, // Map incidentId to incident_id
			status: r.status as IncidentReportStatus,
			message: r.message,
			timestamp: r.timestamp,
		})));
		if (reports.length <= 1) {
			return { error: true, message: "Cannot delete the last report." };
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
	.schema(
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
		return { error: false, message: "Report updated successfully" };
	});
