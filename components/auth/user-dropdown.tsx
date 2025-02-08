"use client";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "usehooks-ts";
import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import Alert from "@/components/ui/alert";
import { User } from "@/lib/auth";
import logOut from "@/components/auth/actions/logout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UserDropdown({ user }: { user: User }) {
	const [open, setOpen] = useState(false);
	const [signOutOpen, setSignOutOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	function SignOutConfirmation() {
		return (
			<>
				<Alert
					title="Are you sure?"
					description="You are about to sign out of your account. Any unsaved changes you may have made will be lost."
					onSubmit={logOut}
					onCancel={() => setOpen(!open)}
					open={signOutOpen}
					setOpen={setSignOutOpen}
				/>
			</>
		);
	}

	return (
		<>
			{isDesktop ? (
				<>
					{user && (
						<>
							<DropdownMenu open={open} onOpenChange={setOpen}>
								<DropdownMenuTrigger
									asChild
									className="cursor-pointer"
								>
									<Avatar className="border border-black/10 dark:border dark:border-white/10">
										<AvatarImage
											src={user.image ?? undefined}
											alt="Avatar"
											aria-label="Avatar"
										/>
										<AvatarFallback>
											{(user.username ?? "T")
												.slice(0, 1)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>
										Welcome back, {user.username}!
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<Link href="/dashboard/profile">
											<DropdownMenuItem>
												Profile
											</DropdownMenuItem>
										</Link>
										<Link href="/dashboard/settings">
											<DropdownMenuItem>
												Settings
											</DropdownMenuItem>
										</Link>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<Link
										href="https://github.com/nord-studio/iris"
										target="_blank"
									>
										<DropdownMenuItem>
											GitHub
										</DropdownMenuItem>
									</Link>
									<Link
										href="https://github.com/nord-studio/iris/issues"
										target="_blank"
									>
										<DropdownMenuItem>
											Support
										</DropdownMenuItem>
									</Link>
									<DropdownMenuItem disabled>
										API
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => {
											setOpen(!open);
											setSignOutOpen(!signOutOpen);
										}}
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Sign out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<SignOutConfirmation />
						</>
					)}
				</>
			) : (
				<>
					{user && (
						<>
							<Drawer open={open} onOpenChange={setOpen}>
								<DrawerTrigger
									asChild
									className="cursor-pointer"
								>
									<Avatar className="border border-black/10 dark:border dark:border-white/10">
										<AvatarImage
											src={user.image ?? undefined}
											alt="Avatar"
											aria-label="Avatar"
										/>
										<AvatarFallback>
											{(user.name ?? "A")
												.slice(0, 1)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</DrawerTrigger>
								<DrawerContent className="border-0 p-0"></DrawerContent>
							</Drawer>

							<SignOutConfirmation />
						</>
					)}
				</>
			)}
		</>
	);
}
