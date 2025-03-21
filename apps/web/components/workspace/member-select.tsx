"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { getAllUsers } from "@/components/workspace/actions";
import { User } from "@/lib/auth";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

export default function MemberSelect({ children }: { children: React.ReactNode }) {
	const [users, setUsers] = React.useState<User[]>([]);
	const [user, setUser] = React.useState<User | null>(null);
	const [role, setRole] = React.useState<"member" | "admin" | "owner">("member");

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
		<>
			<Popover>
				<PopoverTrigger asChild className="py-2 px-3 w-full">
					<Button
						variant="outline"
						role="combobox"
						className="h-auto"
					>
						<div className="flex flex-wrap gap-1 items-center text-start w-full">
							{users.length > 0 ? (
								users.map((user) => (
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
				<PopoverContent>
					<Select>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select a user" />
						</SelectTrigger>
						<SelectContent>
							{users.map((user) => (
								<SelectItem key={user.id} value={user.id}>
									{user.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select a role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="member">Member</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
							<SelectItem value="owner">Owner</SelectItem>
						</SelectContent>
					</Select>
				</PopoverContent>
			</Popover>
		</>
	)
}