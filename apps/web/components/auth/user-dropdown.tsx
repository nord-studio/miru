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
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";

export default function UserDropdown({ user }: { user: User }) {
	const pathname = usePathname();
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
										<Link
											href={`/admin/${pathname.split("/")[2]
												}/settings/profile`}
										>
											<DropdownMenuItem>
												<UserIcon className="mr-2 h-4 w-4" />
												Profile
											</DropdownMenuItem>
										</Link>
										<Link
											href={`/admin/${pathname.split("/")[2]
												}/settings`}
										>
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
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
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
											href={`/admin/${pathname.split("/")[2]
												}/settings/profile`}
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
											href={`/admin/${pathname.split("/")[2]
												}/settings`}
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
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="mr-3 h-4 w-4"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
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
