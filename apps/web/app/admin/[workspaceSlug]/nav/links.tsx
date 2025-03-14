"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NavLinks() {
	const params = useParams();
	if (!params?.workspaceSlug) return null;

	return (
		<>
			<Link href={`/admin/${params?.workspaceSlug}/monitors`}>
				<Button variant="link">Monitors</Button>
			</Link>
			<Link href={`/admin/${params?.workspaceSlug}/incidents`}>
				<Button variant="link">Incidents</Button>
			</Link>
			{/* <Link href={`/admin/${params?.workspaceSlug}/status-pages`}> */}
			<Button variant="link" disabled>
				Status Pages
			</Button>
			{/* </Link> */}
			{/* <Link href={`/admin/${params?.workspaceSlug}/notifications`}> */}
			<Button variant="link" disabled>
				Notifications
			</Button>
			{/* </Link> */}
			<Link href={`/admin/${params?.workspaceSlug}/settings`}>
				<Button variant="link">Settings</Button>
			</Link>
		</>
	);
}
