import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function NavLinks({ workspaceSlug }: { workspaceSlug: string }) {
	return (
		<>
			<Link href={`/admin/${workspaceSlug}/monitors`}>
				<Button variant="link">Monitors</Button>
			</Link>
			<Link href={`/admin/${workspaceSlug}/incidents`}>
				<Button variant="link">Incidents</Button>
			</Link>
			<Link href={`/admin/${workspaceSlug}/status-pages`}>
				<Button variant="link">
					Status Pages
				</Button>
			</Link>
			{/* <Link href={`/admin/${params?.workspaceSlug}/notifications`}> */}
			<Button variant="link" disabled>
				Notifications
			</Button>
			{/* </Link> */}
			<Link href={`/admin/${workspaceSlug}/settings`}>
				<Button variant="link">Settings</Button>
			</Link>
		</>
	);
}
