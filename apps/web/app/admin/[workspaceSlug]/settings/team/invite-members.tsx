"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { getAllUsers, inviteMemberViaEmail } from "@/components/workspace/actions";
import { User } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { RankedRoles, Workspace, WorkspaceMemberWithUser } from "@/types/workspace";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export default function InviteMembers({ workspace, members, currentMember, children }: { workspace: Workspace, members: WorkspaceMemberWithUser[], currentMember: WorkspaceMemberWithUser, children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"email" | "select" | null>(null);

  // Via email
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"member" | "admin" | "owner">("member");

  // Via select
  const [selectOpen, setSelectOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  useEffect(() => {
    getAllUsers().then((users) => {
      if (users?.data) {
        setUsers(users.data);
      } else {
        throw new Error("Failed to fetch users");
      }
    })
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const t = toast.loading("Inviting member...");

    if (mode === "email") {
      await inviteMemberViaEmail({
        workspace,
        email,
        role,
      }).then((res) => {
        if (typeof res?.validationErrors !== "undefined") {
          return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
            description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
            id: t
          });
        }

        if (res?.data?.error) {
          return toast.error("Something went wrong!", {
            description: res.data.message,
            id: t
          });
        }

        toast.success("Member invited successfully!", {
          id: t
        });
        setMode(null);
        setOpen(false);
      }).finally(() => setLoading(false))
    }

    if (mode === "select") {
      if (!selectedUser) {
        return toast.error("Please select a user", {
          id: t
        });
      }

      await inviteMemberViaEmail({
        workspace,
        email: selectedUser.email,
        role
      }).then((res) => {
        if (typeof res?.validationErrors !== "undefined") {
          return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
            description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
            id: t
          });
        }

        if (res?.data?.error) {
          return toast.error("Something went wrong!", {
            description: res.data.message,
            id: t
          });
        }

        toast.success("Member invited successfully!", {
          id: t
        });
        setMode(null);
        setOpen(false);
      }).finally(() => setLoading(false))
    }
  }

  if (mode === "email") {
    if (isDesktop) {
      return (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {children}
            </DialogTrigger>
            <DialogContent className="p-0 sm:max-w-[425px]">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>
                  Invite a member to join this workspace.
                  They will be sent an email with an invite link.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit}>
                <div className="flex flex-col px-6 pb-4 gap-4">
                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
                  </div>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label>Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as "member" | "admin" | "owner")}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue>{role.slice(0, 1).toUpperCase() + role.slice(1)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        {RankedRoles[currentMember.role] >= RankedRoles.admin && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                        {RankedRoles[currentMember.role] >= RankedRoles.owner && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => setMode(null)}
                  >
                    Back
                  </Button>
                  <Button disabled={loading} type="submit">
                    {loading ? <Spinner /> : "Invite"}
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
            <DrawerTrigger asChild>
              {children}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Invite Members</DrawerTitle>
                <DrawerDescription>
                  Select from the list of users to invite to this workspace.
                  They will be sent an email with an invite link.
                </DrawerDescription>
              </DrawerHeader>
              <form onSubmit={onSubmit}>
                <div className="flex flex-col px-6 pb-4 gap-4">
                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
                  </div>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label>Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as "member" | "admin" | "owner")}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue>{role.slice(0, 1).toUpperCase() + role.slice(1)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        {RankedRoles[currentMember.role] >= RankedRoles.admin && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                        {RankedRoles[currentMember.role] >= RankedRoles.owner && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => setMode(null)}
                  >
                    Back
                  </Button>
                  <Button disabled={loading} type="submit">
                    {loading ? <Spinner /> : "Invite"}
                  </Button>
                </div>
              </form>
            </DrawerContent>
          </Drawer>
        </>
      );
    }
  } if (mode === "select") {
    if (isDesktop) {
      const filteredUsers = users.filter((user) => !members.find((member) => member.user.id === user.id));
      return (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {children}
            </DialogTrigger>
            <DialogContent className="p-0 sm:max-w-[425px]">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>
                  Invite a member to join this workspace.
                  They will be sent an email with an invite link.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit}>
                <div className="flex flex-col px-6 pb-4 gap-4">
                  <div className="flex flex-col gap-3 items-start w-full">
                    <Label>Member</Label>
                    <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          aria-expanded={selectOpen}
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedUser ? selectedUser.name
                            : "Select user..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search user..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                              {filteredUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={(currentValue) => {
                                    setSelectedUser(users.find((user) => user.id === currentValue) || null)
                                    setSelectOpen(false)
                                  }}
                                >
                                  {user.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-3 items-start w-full">
                    <Label>Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as "member" | "admin" | "owner")}
                    >
                      <SelectTrigger>
                        <SelectValue>{role}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        {RankedRoles[currentMember.role] >= RankedRoles.admin && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                        {RankedRoles[currentMember.role] >= RankedRoles.owner && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => setMode(null)}
                  >
                    Back
                  </Button>
                  <Button disabled={loading} type="submit">
                    {loading ? <Spinner /> : "Invite"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      );
    } else {
      const filteredUsers = users.filter((user) => !members.find((member) => member.user.id === user.id));
      return (
        <>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              {children}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Invite Members</DrawerTitle>
                <DrawerDescription>
                  Select from the list of users to invite to this workspace.
                  They will be sent an email with an invite link.
                </DrawerDescription>
              </DrawerHeader>
              <form onSubmit={onSubmit}>
                <div className="flex flex-col px-6 pb-4 gap-4">
                  <div className="flex flex-col gap-3 items-start w-full">
                    <Label>Member</Label>
                    <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          aria-expanded={selectOpen}
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedUser ? selectedUser.name
                            : "Select user..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search user..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                              {filteredUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={(currentValue) => {
                                    setSelectedUser(users.find((user) => user.id === currentValue) || null)
                                    setSelectOpen(false)
                                  }}
                                >
                                  {user.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-3 items-start w-full">
                    <Label>Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as "member" | "admin" | "owner")}
                    >
                      <SelectTrigger>
                        <SelectValue>{role}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        {RankedRoles[currentMember.role] >= RankedRoles.admin && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                        {RankedRoles[currentMember.role] >= RankedRoles.owner && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => setMode(null)}
                  >
                    Back
                  </Button>
                  <Button disabled={loading} type="submit">
                    {loading ? <Spinner /> : "Invite"}
                  </Button>
                </div>
              </form>
            </DrawerContent>
          </Drawer>
        </>
      );
    }
  } else {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
          <DialogContent className="p-0 sm:max-w-[425px]">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>
                Invite a member to join this workspace.
                They will be sent an email with an invite link.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col px-6 py-3 gap-4">
              <div className="flex flex-col gap-3">
                <Button onClick={() => setMode("email")}>
                  Invite via Email
                </Button>
                <Button onClick={() => setMode("select")} variant="secondary">
                  Invite existing user
                </Button>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
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
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}