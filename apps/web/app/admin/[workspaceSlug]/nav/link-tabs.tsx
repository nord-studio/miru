"use client";

import { useParams, useSelectedLayoutSegment } from "next/navigation";

import { TabsContainer, TabsLink } from "@/components/ui/tabs-link";

export function LinkTabs() {
	const params = useParams();
	const selectedSegment = useSelectedLayoutSegment();

	if (!params?.workspaceSlug) return null;

	const pagesConfig = [
		{
			title: "Monitors",
			segment: "monitors",
			href: "/monitors",
		},
		{
			title: "Incidents",
			segment: "incidents",
			href: "/incidents",
		},
		{
			title: "Status Pages",
			segment: "status-pages",
			href: "/status-pages",
		},
		{
			title: "Notifications",
			segment: "notifications",
			href: "/notifications",
		},
		{
			title: "Settings",
			segment: "settings",
			href: "/settings",
		},
	];

	return (
		<div className="-mb-3">
			<TabsContainer>
				{pagesConfig.map(({ title, segment, href }) => {
					const active = segment === selectedSegment;
					return (
						<TabsLink
							key={segment}
							active={active}
							href={`/admin/${params?.workspaceSlug}${href}`}
							prefetch={false}
							className="relative"
						>
							{title}
						</TabsLink>
					);
				})}
			</TabsContainer>
		</div>
	);
}
