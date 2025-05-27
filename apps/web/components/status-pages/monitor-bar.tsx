import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { StatusDayBlock } from "@/types/monitor";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const StatusMonitorBarVariants = cva("h-10 rounded-[4px] flex-1", {
	variants: {
		variant: {
			operational: "bg-green-500/80 dark:bg-green-400/80",
			degraded: "bg-yellow-500/80 dark:bg-yellow-400/80",
			down: "bg-red-500/80 dark:bg-red-400/80",
			maintenance: "bg-blue-500/80 dark:bg-blue-400/80",
			empty: "bg-neutral-200 dark:bg-neutral-800"
		}
	},
	defaultVariants: {
		variant: "empty"
	}
});


export function StatusMonitorBar({ data }: { data: StatusDayBlock }) {
	let variant: "operational" | "degraded" | "down" | "maintenance" | "empty" | null | undefined = "operational";
	if (data.totalPings === 0) {
		variant = "empty";
	}

	if (data.incidents.length > 0) {
		variant = "degraded";
	}

	if (data.events.length > 0) {
		variant = "maintenance";
	}

	return (
		<>
			<HoverCard
				openDelay={100}
				closeDelay={100}
			>
				<HoverCardTrigger asChild>
					<div
						className={cn(StatusMonitorBarVariants({ variant }))}
					/>
				</HoverCardTrigger>
				<HoverCardContent asChild className="p-0 w-full">
					<div className="flex flex-col gap-1 items-center w-full max-w-[200px]">
						<div className="flex flex-row gap-4 items-center justify-between w-full px-2 pt-2">
							<span className="font-md font-bold text-start">
								{variant === "empty" && "Empty"}
								{variant === "operational" && "Operational"}
								{variant === "maintenance" && "Maintenance"}
								{variant === "degraded" && "Degraded"}
							</span>
							<span className="text-neutral-500 dark:text-neutral-400 text-sm">{format(data.date, "dd MMM")}</span>
						</div>
						<div className={cn("flex flex-row gap-4 items-center justify-between w-full px-2", data.incidents.length <= 0 ? "pb-2" : "pb-1")}>
							<span className="text-sm">
								<span className="text-green-500/80 dark:text-green-400/80">
									{data.totalPings} {" "}
								</span>
								Requests
							</span>
							<span className="text-sm">
								<span className="text-red-500/80 dark:text-red-400/80">
									{data.failedPings} {" "}
								</span>
								Failed
							</span>
						</div>
						<div className="flex flex-col gap-0 items-center justify-between w-full">
							{data.incidents.map((incident) => {
								return (
									<div key={incident.id} className="flex flex-col gap-2 items-center w-full group">
										<hr className="w-full" />
										<Link href={`/incidents/${incident.id}`} className="w-full">
											<button className="flex flex-row gap-2 items-center justify-between w-full hover:cursor-pointer px-2 pb-2" key={incident.id}>
												<span className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
													{incident.title.slice(0, 20)}{incident.title.length > 20 ? "..." : ""}
												</span>
												<ArrowRight className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
											</button>
										</Link>
									</div>
								)
							})}
							{data.events.map((event) => {
								return (
									<div key={event.id} className="flex flex-col gap-2 items-center w-full group">
										<hr className="w-full" />
										<Link href={`/events/${event.id}`} className="w-full">
											<button className="flex flex-row gap-2 items-center justify-between w-full hover:cursor-pointer px-2 pb-2" key={event.id}>
												<span className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
													{event.title.slice(0, 20)}{event.title.length > 20 ? "..." : ""}
												</span>
												<ArrowRight className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
											</button>
										</Link>
									</div>
								)
							})}
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		</>
	)
}