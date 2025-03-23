import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { joinWorkspace } from "@/components/workspace/actions";
import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export default function JoinWorkspace({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);
	const [inviteToken, setInviteToken] = useState("");

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		await joinWorkspace({ inviteToken }).then((res) => {
			if (res?.validationErrors) {
				return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
				});
			}

			if (res?.data?.error) {
				return toast.error("Something went wrong!", {
					description: res?.data?.message,
				});
			}
		}).finally(() => setLoading(false));
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Join Workspace</DialogTitle>
							<DialogDescription>
								Please provide an invite token to join a workspace.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-3 items-start w-full">
									<Label>Invite Token</Label>
									<Input
										disabled={loading}
										required={true}
										value={inviteToken}
										onChange={(e) =>
											setInviteToken(e.target.value)
										}
									/>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<DialogClose asChild>
									<Button
										variant="outline"
										type="button"
										disabled={loading}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button disabled={loading} type="submit">
									{loading ? (
										<>
											<Spinner />
											<span className="ml-2">Joining...</span>
										</>
									) : "Join"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</>
		);
	} else {
		return (
			<>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Join Workspace</DrawerTitle>
							<DrawerDescription>
								Please provide an invite token to join a workspace.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Invite Code</Label>
									<Input disabled={loading} value={inviteToken} onChange={(e) => setInviteToken(e.target.value)} />
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<span className="text-neutral-400 dark:text-neutral-600 text-sm">
									Note: You can update this later.
								</span>
								<div className="flex flex-row gap-2 items-center">
									<DialogClose asChild>
										<Button
											variant="outline"
											type="button"
											disabled={loading}
										>
											Cancel
										</Button>
									</DialogClose>
									<Button disabled={loading} type="submit">
										{loading ? <Spinner /> : "Create"}
									</Button>
								</div>
							</div>
						</form>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}