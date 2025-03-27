"use client";

import { Drawer } from "vaul";
import {
	Search,
	XIcon,
	MenuIcon,
	CogIcon,
	BellIcon,
	Code,
	Megaphone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";

export default function MobileNavbar() {
	const pathname = usePathname();
	const currentWorkspace = pathname.split("/")[2];

	return (
		<>
			<Drawer.Root direction="right">
				<Drawer.Trigger asChild>
					<Button variant="outline" size="icon">
						<MenuIcon className="w-6 h-6" />
					</Button>
				</Drawer.Trigger>
				<Drawer.Portal>
					<Drawer.Overlay className="fixed inset-0 bg-black/50" />
					<Drawer.Content className="flex flex-col rounded-t-[10px] h-full w-[200px] mt-24 fixed bottom-0 right-0">
						{/* Primative doesn't include this */}
						<DialogTitle />
						<div className="flex-1 h-full p-4 bg-neutral-50 dark:bg-neutral-950 rounded-l-md ">
							<div className="max-w-md mx-auto">
								<div className="flex flex-row items-center justify-between">
									<Link href="/" passHref>
										<h2 className="text-lg font-black font-display text-neutral-500 dark:text-neutral-400">
											見る
										</h2>
									</Link>
									<Drawer.Close asChild>
										<Button size="icon" variant="ghost">
											<XIcon className="w-6 h-6" />
										</Button>
									</Drawer.Close>
								</div>
								<hr className="my-4 border-b border-black/10 dark:border-white/10" />
								<div className="flex flex-col items-start w-full gap-4 ">
									<Link
										href={`/admin/${currentWorkspace}/monitors`}
										passHref
										className="w-full"
									>
										<Drawer.Close
											className="w-full"
											asChild
										>
											<Button
												variant="ghost"
												className="flex flex-row w-full gap-2 justify-start"
											>
												<Search className="w-6 h-6" />{" "}
												Monitors
											</Button>
										</Drawer.Close>
									</Link>
									<Link
										href={`/admin/${currentWorkspace}/incidents`}
										passHref
										className="w-full"
									>
										<Drawer.Close
											className="w-full"
											asChild
										>
											<Button
												variant="ghost"
												className="flex flex-row w-full gap-2 justify-start"
											>
												<Megaphone className="w-6 h-6" />{" "}
												Incidents
											</Button>
										</Drawer.Close>
									</Link>
									<Link
										href={`/admin/${currentWorkspace}/status-pages`}
										passHref
										className="w-full"
									>
										<Drawer.Close
											className="w-full"
											asChild
										>
											<Button
												variant="ghost"
												className="flex flex-row w-full gap-2 justify-start"
											>
												<Code className="w-6 h-6" />{" "}
												Status Pages
											</Button>
										</Drawer.Close>
									</Link>
									{/* <Link
										href={`/admin/${currentWorkspace}/notifications`}
										passHref
										className="w-full"
									>
										<Drawer.Close
											className="w-full"
											asChild
										> */}
									<Button
										variant="ghost"
										className="flex flex-row w-full gap-2 justify-start"
										disabled={true}
									>
										<BellIcon className="w-6 h-6" />{" "}
										Notifications
									</Button>
									{/* </Drawer.Close>
									</Link> */}
									<Link
										href={`/admin/${currentWorkspace}/settings`}
										passHref
										className="w-full"
									>
										<Drawer.Close
											className="w-full"
											asChild
										>
											<Button
												variant="ghost"
												className="flex flex-row w-full gap-2 justify-start"
											>
												<CogIcon className="w-6 h-6" />{" "}
												Settings
											</Button>
										</Drawer.Close>
									</Link>
								</div>
							</div>
						</div>
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root >
		</>
	);
}
