"use client";

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";

export default function DateTimePicker({ date, setDate, disabled = false }: { date: Date | undefined; setDate: (date: Date) => void, disabled?: boolean }) {
	const [isOpen, setIsOpen] = React.useState(false);

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
		}
	};

	const handleTimeChange = (
		type: "hour" | "minute",
		value: string
	) => {
		if (date) {
			const newDate = new Date(date);
			if (type === "hour") {
				newDate.setHours(parseInt(value));
			} else if (type === "minute") {
				newDate.setMinutes(parseInt(value));
			}
			setDate(newDate);
		}
	};

	return (
		<Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left px-3 font-normal",
						!date && "text-muted-foreground"
					)}
					disabled={disabled}
				>
					{date ? (
						format(date, "MM/dd/yyyy hh:mm")
					) : (
						<span>MM/DD/YYYY hh:mm</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" sideOffset={8}>
				<div className="sm:flex sm:h-[320px]">
					<Calendar
						mode="single"
						selected={date}
						onSelect={handleDateSelect}
					/>
					<div className="flex flex-col sm:flex-row sm:h-[320px] divide-y sm:divide-y-0 sm:divide-x border-t sm:border-t-0 sm:border-l">
						<ScrollArea className="w-64 sm:w-auto sm:h-[320px]">
							<div className="flex sm:flex-col p-2">
								{hours.reverse().map((hour) => (
									<Button
										key={hour}
										size="icon"
										variant={date && date.getHours() === hour ? "default" : "ghost"}
										className="sm:w-full shrink-0 aspect-square"
										onClick={() => handleTimeChange("hour", hour.toString())}
									>
										{hour}
									</Button>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="sm:hidden" />
						</ScrollArea>
						<ScrollArea className="w-64 sm:w-auto sm:h-[320px]">
							<div className="flex sm:flex-col p-2">
								{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
									<Button
										key={minute}
										size="icon"
										variant={date && date.getMinutes() === minute ? "default" : "ghost"}
										className="sm:w-full shrink-0 aspect-square"
										onClick={() => handleTimeChange("minute", minute.toString())}
									>
										{minute.toString().padStart(2, '0')}
									</Button>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="sm:hidden" />
						</ScrollArea>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}