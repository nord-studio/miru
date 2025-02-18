import MonitorDetailNav from "@/app/dashboard/monitors/[id]/nav";
import Navbar from "@/app/dashboard/nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default async function MonitorSingletonLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	console.log(id);
	return (
		<>
			<MonitorDetailNav />
			<div className="w-full">{children}</div>
		</>
	);
}
