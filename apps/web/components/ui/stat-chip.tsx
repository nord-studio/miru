import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statChipVariant = cva("flex flex-col px-3 py-2 border rounded-lg", {
	variants: {
		variant: {
			green: "border-green-500/20 bg-green-500/10 [&>p]:text-green-600 dark:[&>p]:text-green-400",
			red: "border-red-500/20 bg-red-500/10 [&>p]:text-red-600 dark:[&>p]:text-red-400",
			neutral: "border-border/80 bg-muted/30",
			ghost: "border-transparent",
			bordered: "",
		},
	},
	defaultVariants: {
		variant: "green",
	},
});

function StatChip({
	title,
	value,
	measurement,
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"div"> &
	VariantProps<typeof statChipVariant> & {
		title: string;
		value: string;
		measurement: string;
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="div"
			className={cn(statChipVariant({ variant, className }))}
			{...props}
		>
			<p className="font-medium text-muted-foreground text-sm uppercase">
				{title}
			</p>
			<div>
				<div className="flex flex-1 flex-wrap items-center gap-2">
					<p className="flex">
						<code className="mr-1 font-mono font-semibold text-xl empty:mr-0">
							{value}
						</code>
						<span className="self-center text-muted-foreground text-xs">
							{measurement}
						</span>
					</p>
					{/* I'll do something with this later */}
					{/* <div className="inline-flex items-center border rounded-full py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-1.5 text-[10px] border-border">
						<span>0%</span>
					</div> */}
				</div>
			</div>
		</Comp>
	);
}

export { StatChip, statChipVariant };
