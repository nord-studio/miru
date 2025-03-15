import { redirect } from "next/navigation";

export default async function WorkspaceMonitorRedirect(props: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const params = await props.params;
	return redirect(`/admin/${params.workspaceSlug}/monitors`);
}
