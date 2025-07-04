"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Monitor } from "@miru/types";

export default function MonitorSelection({
	monitors,
	value,
	setValue,
	min = 0,
	disabled = false,
}: {
	monitors: Monitor[];
	value: Monitor[];
	setValue: React.Dispatch<React.SetStateAction<Monitor[]>>;
	min?: number;
	disabled?: boolean;
}) {
	const [open, setOpen] = React.useState(false);

	const toggleSelect = (monitor: Monitor) => {
		setValue((prev) =>
			prev.some((g) => g.id === monitor.id)
				? prev.filter((g) => g.id !== monitor.id)
				: [...prev, monitor]
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild className="py-2 px-3 w-full">
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="h-auto"
					disabled={disabled}
				>
					<div className="flex flex-wrap gap-1 items-center text-start w-full">
						{value.length > 0 ? (
							value.map((monitor) => (
								<Badge
									key={monitor.id}
									variant="default"
									className="text-xs font-normal"
								>
									{monitor.name}
								</Badge>
							))
						) : (
							<span className="text-muted-foreground">
								Select monitors
							</span>
						)}
					</div>
					<ChevronsUpDown className="ml-2 h-2 w-2 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command>
					<CommandInput placeholder="Search monitors..." />
					<CommandList className="w-full">
						<CommandEmpty>No monitors found.</CommandEmpty>
						<CommandGroup className="w-full">
							{monitors.map((monitor) => (
								<CommandItem
									key={monitor.id}
									onSelect={() => toggleSelect(monitor)}
									className="cursor-pointer"
									disabled={
										value.includes(monitor) &&
										value.length <= min
									}
								>
									<Check
										className={`mr-2 h-4 w-4 ${value.some(m => m.id === monitor.id)
											? "opacity-100"
											: "opacity-0"
											}`}
									/>
									{monitor.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
