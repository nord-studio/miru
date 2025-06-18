"use client";
import { HeartPulseIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart"

export default function MonitorGraph({ data }: {
	data: {
		date: string;
		latency: number;
	}[]
}) {

	const chartConfig = {
		latency: {
			label: "Latency",
			color: "hsl(220, 98%, 61%)",
		},
	} satisfies ChartConfig

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle className="flex flex-row gap-2 items-center">
					<HeartPulseIcon size={22} />
					Latency
				</CardTitle>
				<CardDescription>
					Showing monitor latency over the last 100 pings.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip cursor={false} content={({ active, payload }) => {
							if (active && payload && payload.length) {
								const data = payload[0];
								return (
									<div className="rounded-lg border bg-background p-2 shadow-md">
										<div className="grid grid-rows-2 gap-2">
											<div className="flex flex-col">
												<span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
												<span className="font-bold text-muted-foreground">{data.payload.date}</span>
											</div>
											<div className="flex flex-col">
												<span className="text-[0.70rem] uppercase text-muted-foreground">Latency</span>
												<span className="font-bold" style={{ color: data.color }}>
													{data.payload.latency}ms
												</span>
											</div>
										</div>
									</div>
								)
							}
							return null
						}} />
						<defs>
							<linearGradient id="fillLatency" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-latency)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-latency)" stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<Area
							dataKey="latency"
							type="natural"
							fill="url(#fillLatency)"
							fillOpacity={1}
							stroke="var(--color-latency)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}