import { DateTimeTooltip } from "@/components/ui/datetime-tooltip";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { AlertTriangleIcon, Check, Hammer, Minus } from "lucide-react";

const StatusBannerVariant = cva(
	"flex items-center gap-3 rounded-lg border p-3",
	{
		variants: {
			variant: {
				operational: "border-green-500/20 bg-green-500/10 [&>p]:text-green-600 dark:[&>p]:text-green-400",
				down: "border-red-500/20 bg-red-500/10 [&>p]:text-red-600 dark:[&>p]:text-red-400",
				degraded: "border-amber-500/20 bg-amber-500/10 [&>p]:text-amber-600 dark:[&>p]:text-amber-400",
				maintenance: "border-blue-500/20 bg-blue-500/10 [&>p]:text-blue-600 dark:[&>p]:text-blue-400",
			},
		},
		defaultVariants: {
			variant: "operational",
		},
	}
);

export function StatusIcon({ variant }: { variant: VariantProps<typeof StatusBannerVariant>["variant"] }) {
	if (variant === "degraded") {
		return <AlertTriangleIcon className="h-5 w-5 text-background" />;
	}
	if (variant === "maintenance") {
		return <Hammer className="h-5 w-5 text-background" />;
	}
	if (variant === "down") {
		return <Minus className="h-5 w-5 text-background" />;
	}
	return <Check className="h-5 w-5 text-background" />;
}

function StatusBanner({
	className,
	variant = "operational",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof StatusBannerVariant>) {
	return (
		<div
			className={cn(
				StatusBannerVariant({ variant, className }),
			)} {...props}
		>
			<span className={cn(
				"rounded-full border p-1.5 w-fit",
				variant === "operational" && "bg-green-500 dark:bg-green-400",
				variant === "down" && "bg-red-500 dark:bg-red-400",
				variant === "degraded" && "bg-amber-500 dark:bg-amber-400",
				variant === "maintenance" && "bg-blue-500 dark:bg-blue-400",
				className
			)}>
				<StatusIcon variant={variant} />
			</span>
			<div className="flex w-full flex-wrap items-center justify-between gap-4">
				<h2 className="font-semibold text-xl">
					{variant === "operational" && "All Systems Operational"}
					{variant === "down" && "All Systems Down"}
					{variant === "degraded" && "Degraded Performance"}
					{variant === "maintenance" && "Under Maintenance"}
				</h2>
				<p className="text-xs">
					<DateTimeTooltip date={new Date()} />
				</p>
			</div>
		</div>
	);
}

export { StatusBanner, StatusBannerVariant };
