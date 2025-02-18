"use client";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
	BookTextIcon,
	CodeIcon,
	CogIcon,
	LogOut,
	UserIcon,
} from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { useEffect, useState } from "react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import Alert from "@/components/ui/alert";
import { User } from "@/lib/auth";
import logOut from "@/components/auth/actions/logout";
import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDropdown({ user }: { user: User }) {
	const [mounted, setMounted] = useState(false);
	const [open, setOpen] = useState(false);
	const [signOutOpen, setSignOutOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	useEffect(() => {
		setMounted(true);
	}, []);

	function SignOutConfirmation() {
		return (
			<>
				{mounted && (
					<Alert
						title="Are you sure?"
						description="You are about to sign out of your account. Any unsaved changes you may have made will be lost."
						onSubmit={logOut}
						onCancel={() => setOpen(!open)}
						open={signOutOpen}
						setOpen={setSignOutOpen}
					/>
				)}
			</>
		);
	}

	if (!mounted)
		return (
			<>
				<Skeleton className="size-8 rounded-full" />
			</>
		);

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
										<Link href="/dashboard/settings/profile">
											<DropdownMenuItem>
												<UserIcon className="mr-2 h-4 w-4" />
												Profile
											</DropdownMenuItem>
										</Link>
										<Link href="/dashboard/settings">
											<DropdownMenuItem>
												<CogIcon className="mr-2 h-4 w-4" />
												Settings
											</DropdownMenuItem>
										</Link>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<Link
										href="https://github.com/nord-studio/miru"
										target="_blank"
									>
										<DropdownMenuItem>
											<SiGithub className="mr-2 h-4 w-4" />
											GitHub
										</DropdownMenuItem>
									</Link>
									<Link
										href="https://miru.nordstud.io/docs"
										target="_blank"
									>
										<DropdownMenuItem>
											<BookTextIcon className="mr-2 h-4 w-4" />
											Docs
										</DropdownMenuItem>
									</Link>
									<DropdownMenuItem disabled>
										<CodeIcon className="mr-2 h-4 w-4" />
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
								<DrawerContent className="border-0 p-0">
									<DrawerHeader>
										<DrawerTitle className="text-xl font-bold font-display">
											Welcome Back, {user.username}
										</DrawerTitle>
									</DrawerHeader>
									<hr className="w-full border-b border-black/10 dark:border-white/10" />
									<div className="flex flex-col items-start">
										<Link
											href="/dashboard/settings/profile"
											className="w-full"
										>
											<DrawerClose className="w-full">
												<div className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50">
													<UserIcon className="mr-3 h-4 w-4" />
													<span>Profile</span>
												</div>
											</DrawerClose>
										</Link>
										<Link
											href="/dashboard/settings"
											className="w-full"
										>
											<DrawerClose className="w-full">
												<div className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50">
													<CogIcon className="mr-3 h-4 w-4" />
													<span>Settings</span>
												</div>
											</DrawerClose>
										</Link>
										<hr className="w-full border-b border-black/10 dark:border-white/10" />
										<Link
											href="https://github.com/nord-studio/miru"
											className="w-full"
											target="_blank"
										>
											<DrawerClose className="w-full">
												<div className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50">
													<SiGithub className="mr-3 h-4 w-4" />
													<span>GitHub</span>
												</div>
											</DrawerClose>
										</Link>
										<Link
											href="https://miru.nordstud.io/docs"
											className="w-full"
											target="_blank"
										>
											<DrawerClose className="w-full">
												<div className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50">
													<BookTextIcon className="mr-3 h-4 w-4" />
													<span>Docs</span>
												</div>
											</DrawerClose>
										</Link>
										<div
											className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50"
											data-disabled={true}
										>
											<CodeIcon className="mr-3 h-4 w-4" />
											<span>API</span>
										</div>
										<hr className="w-full border-b border-black/10 dark:border-white/10" />
										<DrawerClose className="w-full">
											<div
												className="text-md flex cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50"
												onClick={() =>
													setSignOutOpen(!signOutOpen)
												}
											>
												<LogOut className="mr-3 h-4 w-4" />
												<span>Sign out</span>
											</div>
										</DrawerClose>
									</div>
								</DrawerContent>
							</Drawer>

							<SignOutConfirmation />
						</>
					)}
				</>
			)}
		</>
	);
}
