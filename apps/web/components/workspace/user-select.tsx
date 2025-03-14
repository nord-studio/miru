"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { User } from "better-auth";
import { getAllUsers } from "@/components/workspace/actions";

export default function UserSelection({
	value,
	setValue,
	min = 0,
}: {
	value: User[];
	setValue: React.Dispatch<React.SetStateAction<User[]>>;
	min?: number;
}) {
	const [open, setOpen] = React.useState(false);
	const [users, setUsers] = React.useState<User[]>([]);

	const toggleSelect = (user: User) => {
		setValue((prev) =>
			prev.includes(user)
				? prev.filter((g) => g !== user)
				: [...prev, user]
		);
	};

	React.useEffect(() => {
		getAllUsers().then((users) => {
			if (users?.data) {
				setUsers(users.data);
			} else {
				throw new Error("Failed to fetch users");
			}
		});
	}, []);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild className="py-2 px-3 w-full">
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="h-auto"
				>
					<div className="flex flex-wrap gap-1 items-center text-start w-full">
						{value.length > 0 ? (
							value.map((user) => (
								<Badge
									key={user.id}
									variant="default"
									className="text-xs font-normal"
								>
									{user.name}
								</Badge>
							))
						) : (
							<span className="text-muted-foreground">
								Select users
							</span>
						)}
					</div>
					<ChevronsUpDown className="ml-2 h-2 w-2 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command>
					<CommandInput placeholder="Search users..." />
					<CommandList className="w-full">
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup className="w-full">
							{users.map((user) => (
								<CommandItem
									key={user.id}
									onSelect={() => toggleSelect(user)}
									className="cursor-pointer"
									disabled={
										value.includes(user) &&
										value.length <= min
									}
								>
									<Check
										className={`mr-2 h-4 w-4 ${
											value.includes(user)
												? "opacity-100"
												: "opacity-0"
										}`}
									/>
									{user.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
