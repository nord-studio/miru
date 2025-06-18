"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Signpost } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { WorkspaceWithMembers } from "@miru/types";
import CreateWorkspace from "@/components/workspace/create-workspace";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import JoinWorkspace from "@/components/workspace/join-workspace";
import { MiruConfig } from "@miru/types";
import { User } from "@/lib/auth";

export function WorkspaceSwitcher({ workspaces, user, config }: { workspaces: WorkspaceWithMembers[], user: User, config: MiruConfig }) {
	// filter out duplicate workspaces
	workspaces = workspaces.filter(
		(workspace, index) =>
			workspaces.findIndex((w) => w.workspace.id === workspace.workspace.id) === index
	);

	const pathname = usePathname();
	const router = useRouter();

	const [open, setOpen] = React.useState(false);
	const [openCreate, setOpenCreate] = React.useState(false);
	const [openJoin, setOpenJoin] = React.useState(false);
	const [currentWorkspace, setCurrentWorkspace] = React.useState<string>();

	React.useEffect(() => {
		if (pathname.split("/")[2]) {
			setCurrentWorkspace(pathname.split("/")[2]);
		}
	}, [pathname]);

	return (
		<>
			<CreateWorkspace open={openCreate} setOpen={setOpenCreate} />
			<JoinWorkspace open={openJoin} setOpen={setOpenJoin} />
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-[150px] lg:w-[200px] justify-between"
					>
						{currentWorkspace ? (
							<span>{currentWorkspace}</span>
						) : (
							<Skeleton className="h-5 w-full" />
						)}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandInput
							placeholder="Search workspace..."
							className="h-9"
						/>
						<CommandList>
							<CommandEmpty>No workspace found.</CommandEmpty>
							<CommandGroup>
								{workspaces.map((workspace) => (
									<CommandItem
										key={workspace.id}
										value={workspace.id}
										onSelect={() => {
											setCurrentWorkspace(
												workspace.workspace.slug
											);
											setOpen(false);
											router.push(
												`/admin/${workspace.workspace.slug
												}/${pathname.split("/")[3]}`
											);
										}}
									>
										{workspace.workspace.name}
										<Check
											className={cn(
												"ml-auto",
												workspace.workspace.slug ===
													currentWorkspace
													? "opacity-100"
													: "opacity-0"
											)}
										/>
									</CommandItem>
								))}
								<hr className="w-full my-1" />
								{user.admin || config.workspace.creation === true && (
									<CommandItem
										onSelect={() => setOpenCreate(true)}
									>
										Create Workspace
										<Plus className="ml-auto" />
									</CommandItem>
								)}
								<CommandItem
									onSelect={() => setOpenJoin(true)}
								>
									Join Workspace
									<Signpost className="ml-auto" />
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</>
	);
}
