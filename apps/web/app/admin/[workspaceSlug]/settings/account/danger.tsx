import { DeleteAccountConfirm } from "@/app/admin/[workspaceSlug]/settings/account/confirm";
import { User } from "@/lib/auth";

export default function DangerUserSettings({ user }: { user: User }) {
	return (
		<div className="flex flex-col gap-4 w-full">
			<div className="flex flex-col gap-4 pb-4 sm:gap-8">
				<div className="flex w-full flex-col rounded-md border border-red-500/40">
					<div className="flex flex-col gap-4 border-b border-red-500/40 p-6">
						<div className="flex flex-col gap-2">
							<h1 className="text-xl font-bold">Delete Account</h1>
							<p className="text-sm">
								Permanently delete your account and all of its contents from
								your Miru instance. This action is not reversible, so
								please continue with caution.
							</p>
						</div>
					</div>
					<div className="flex flex-row items-center justify-between gap-4 bg-red-500/10 p-4">
						<div />
						<DeleteAccountConfirm user={user} />
					</div>
				</div>
			</div>
		</div>
	)
}