import { StatusMonitorBar } from "@/components/status-pages/monitor-bar"
import { Monitor, StatusDayBlock } from "@miru/types"

export default function DummyMonitor({ monitor, days }: { monitor: Monitor, days: StatusDayBlock[] }) {
	return (
		<div className="flex flex-col gap-2 items-start w-full">
			<div className="flex flex-row gap-2 items-center justify-between w-full">
				<p className="font-semibold text-lg font-display">
					{monitor.name}
				</p>
				<span className="font-mono text-sm">
					100%
				</span>
			</div>
			<div className="relative w-full h-full">
				<div className="sm:flex flex-row gap-px sm:gap-0.5 hidden">
					{days.toReversed().map((v, i) => {
						return (
							<StatusMonitorBar key={i} data={v} />
						)
					})}
				</div>
				<div className="flex-row gap-px sm:gap-0.5 flex sm:hidden">
					{days.slice(0, 30).toReversed().map((v, i) => {
						return (
							<StatusMonitorBar key={i} data={v} />
						)
					})}
				</div>
			</div>
			<div className="flex flex-row gap-2 items-center justify-between w-full">
				<p className="text-sm before:content-['30'] sm:before:content-['45']">{" "} days ago</p>
				<p className="text-sm">Today</p>
			</div>
		</div>
	)
}