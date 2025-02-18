import MonitorDetailNav from "@/app/dashboard/monitors/[id]/nav";
import React from "react";

export default async function MonitorSingletonLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	return (
		<>
			<MonitorDetailNav />
			<div className="w-full">{children}</div>
		</>
	);
}
