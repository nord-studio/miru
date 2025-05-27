import db from "@/lib/db";
import { events } from "@/lib/db/schema";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import SimpleStatusPageShell from "@/designs/simple/shell";
import StormtrooperStatusPageShell from "@/designs/stormtrooper/shell";
import BackButton from "@/components/back-button";
import PandaStatusPageShell from "@/designs/panda/shell";
import Color from "color";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default async function EventSingleton({ params }: { params: Promise<{ domain: string, id: string }> }) {
	const { domain, id } = await params;

	const decodedDomain = decodeURIComponent(domain);

	const statusPage = await db.query.statusPages.findFirst({
		where: sql`(domain = ${decodedDomain} OR (root = true AND domain IS NULL))`,
		orderBy: sql`CASE WHEN domain = ${decodedDomain} THEN 0 ELSE 1 END`,
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		}
	});

	if (!statusPage || statusPage.enabled === false) {
		return notFound();
	}

	const event = await db
		.select()
		.from(events)
		.where(eq(events.id, id))
		.limit(1)
		.then((res) => res[0]);

	if (!event) {
		return notFound();
	}

	const color = Color(statusPage.brandColor || "#5865F2");
	function isLight() {
		if (statusPage!.forcedTheme === "auto") return color.isLight();
		if (statusPage!.forcedTheme === "light") return true;
		if (statusPage!.forcedTheme === "dark") return false;
		else return color.isLight();
	}

	const endsAt = new Date(event.duration * 60 * 1000 + event.startsAt.getTime());
	const inProgress = event.startsAt <= new Date() && endsAt >= new Date();

	function getStatus() {
		if (event.startsAt > new Date()) return "notStarted";
		if (inProgress) return "inProgress";
		if (endsAt < new Date() && !event.completed) return "delayed";
		return "completed";
	}

	const type = getStatus();

	return (
		<>
			{statusPage.design === "simple" && (
				<SimpleStatusPageShell
					page={statusPage}
					header={
						<div className="flex flex-col gap-2 items-start w-full">
							<BackButton />
							<div>
								<h1 className="text-3xl font-black font-display">
									{event.title}
								</h1>
								<p className="text-neutral-500 dark:text-neutral-400">
									{type === "notStarted" && `Starts ${formatDistanceToNow(event.startsAt, { addSuffix: true })}`}
									{type === "inProgress" && "In progress"}
									{type === "delayed" && `Delayed by ${formatDistanceToNow(endsAt, { addSuffix: true })}`}
									{type === "completed" && "Completed"}{" "}
									{" "} • Started at{" "}
									{new Date(event.startsAt).toLocaleString()}
								</p>
							</div>
						</div>
					}>
					<div className="grid gap-4">
						<p>
							{event.message}
						</p>
						<div className="flex flex-col gap-2 items-start">
							<h2 className="text-xl font-semibold">Affected Monitors</h2>
						</div>
					</div>
				</SimpleStatusPageShell>
			)}
			{statusPage.design === "panda" && (
				<PandaStatusPageShell
					page={statusPage}
					header={
						<div className="flex flex-col gap-2 items-start w-full">
							<BackButton isLight={isLight()} />
							<div>
								<h1 className={cn("text-3xl font-black font-display", isLight() ? "text-neutral-900" : "text-neutral-100")}>
									{event.title}
								</h1>
								<p className={cn(isLight() ? "text-neutral-900" : "text-neutral-100")}>
									{type === "notStarted" && `Starts: ${formatDistanceToNow(event.startsAt, { addSuffix: true })}`}
									{type === "inProgress" && "In progress"}
									{type === "delayed" && `Delayed by ${formatDistanceToNow(endsAt, { addSuffix: true })}`}
									{type === "completed" && "Completed"}{" "}
									{" "} • Started at{" "}
									{new Date(event.startsAt).toLocaleString()}
								</p>
							</div>
						</div>
					}>
					<div className="grid gap-4">
						<p>
							{event.message}
						</p>
						<div className="flex flex-col gap-2 items-start">
							<h2 className="text-xl font-semibold">Affected Monitors</h2>
						</div>
					</div>
				</PandaStatusPageShell>
			)}
			{statusPage.design === "stormtrooper" && (
				<StormtrooperStatusPageShell page={statusPage} header={
					<div className="flex flex-col gap-2 items-start w-full">
						<BackButton />
						<div>
							<h1 className="text-3xl font-black font-display">
								{event.title}
							</h1>
							<p className="text-neutral-500 dark:text-neutral-400">
								{type === "notStarted" && `Starts ${formatDistanceToNow(event.startsAt, { addSuffix: true })}`}
								{type === "inProgress" && "In progress"}
								{type === "delayed" && `Delayed by ${formatDistanceToNow(endsAt, { addSuffix: true })}`}
								{type === "completed" && "Completed"}{" "}
								{" "}
								{type !== "notStarted" && (
									"• Started at " +
									new Date(event.startsAt).toLocaleString()
								)}
							</p>
						</div>
					</div>
				}>
					<div className="grid gap-4">
						<p>
							{event.message}
						</p>
					</div>
				</StormtrooperStatusPageShell>
			)}
		</>
	)
}