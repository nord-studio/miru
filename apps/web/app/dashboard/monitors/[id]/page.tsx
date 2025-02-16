import db from "@/lib/db";
import { monitors } from "@/lib/db/schema/monitors";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MonitorDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	const monitor = await db
		.select()
		.from(monitors)
		.where(eq(monitors.id, id))
		.limit(1)
		.then((res) => res[0]);

	if (!monitor) {
		return notFound();
	}

	return (
		<>
			<div className="w-full flex flex-row gap-2 items-center justify-between">
				<div className="flex flex-col">
					<h1 className="text-3xl font-black font-display">
						{monitor.name}
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						<Link href={`https://${monitor.url}`} target="_blank">
							{monitor.url}
						</Link>{" "}
						• {monitor.type.toUpperCase()} • Every{" "}
						{monitor.interval}m
					</p>
				</div>
				<div className="flex flex-row gap-2 items-center"></div>
			</div>
			<div className="container mx-auto mt-4"></div>
		</>
	);
}
