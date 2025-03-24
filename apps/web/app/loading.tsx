import Spinner from "@/components/ui/spinner";

export default function Loading() {
	return (
		<div className="flex h-full min-h-screen w-full flex-col items-center justify-center gap-2">
			<Spinner />
		</div>
	);
}