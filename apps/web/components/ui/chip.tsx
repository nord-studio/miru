import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const ChipVariant = cva(
	"flex flex-col px-2 border rounded-lg w-fit font-mono text-xs",
	{
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
	}
);

function Chip({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof ChipVariant>) {
	return (
		<div
			className={cn(ChipVariant({ variant, className }))}
			{...props}
		></div>
	);
}

export { Chip, ChipVariant };
