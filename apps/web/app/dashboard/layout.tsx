import Navbar from "@/components/navbar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			<div className="flex flex-col w-full h-full border p-4 sm:p-6 border-black/10 dark:border-white/10 rounded-lg mt-4">
				{children}
			</div>
		</>
	);
}
