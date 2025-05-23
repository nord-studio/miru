import React from "react";

export default async function NoWorkspacesLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="max-w-[1200px] mx-auto w-full">
			{children}
		</div>
	)
}