import Navbar from "@/app/dashboard/nav";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className="flex flex-col w-full px-4 sm:px-6 py-2 sm:py-4">
				<Navbar />
				<div className="flex flex-col w-full py-4">{children}</div>
			</div>
		</>
	);
}
