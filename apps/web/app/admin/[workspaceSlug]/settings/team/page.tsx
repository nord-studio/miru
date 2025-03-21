import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { Plus, UserPlus } from "lucide-react";
import { eq } from "drizzle-orm";
import InviteMembers from "@/app/admin/[workspaceSlug]/settings/team/invite-members";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateInviteToken from "@/app/admin/[workspaceSlug]/settings/team/create-invite";
import LeaveWorkspace from "@/app/admin/[workspaceSlug]/settings/team/leave-workspace";

export default async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, workspaceSlug))
    .limit(1)
    .then((res) => res[0]);

  const members = await db.query.workspaceMembers.findMany({
    with: {
      user: true,
    },
    where: () => eq(workspaceMembers.workspaceId, workspace.id),
  });

  const currentUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!currentUser) {
    throw new Error("You are not logged in");
  }

  const currentMember = members.find((member) => member.userId === currentUser.user.id);

  if (!currentMember) {
    throw new Error("You are not a member of this workspace");
  }

  enum rankedRoles {
    member = 0,
    admin = 1,
    owner = 2,
  }

  const appUrl = globalThis.secrets.url ?? "http://localhost:3000";

  return (
    <>
      <main className="flex flex-col gap-4 w-full">
        <div className="flex flex-row gap-4 items-center w-full">
          <div className="flex flex-col w-full">
            <h1 className="text-3xl font-black font-display">Team</h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Your workspace team settings.
            </p>
          </div>
          {currentMember.role !== "member" && (
            <div className="flex flex-row gap-3">
              <CreateInviteToken workspace={workspace} appUrl={appUrl}>
                <Button variant="secondary">
                  <Plus />
                  Create Invite
                </Button>
              </CreateInviteToken>
              <InviteMembers workspace={workspace} members={members}>
                <Button>
                  <UserPlus />
                  Invite Member
                </Button>
              </InviteMembers>
            </div>
          )}
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user.name}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell className="text-right">
                    {member.id === currentMember.id ? (
                      <>
                        {currentMember.role !== "owner" && (
                          <LeaveWorkspace workspace={workspace} />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-row gap-2 justify-end">
                        {rankedRoles[currentMember?.role as keyof typeof rankedRoles] >= rankedRoles[member.role] && (
                          <div className="flex flex-row gap-2 justify-end">
                            <Button size="sm">Manage</Button>
                            {currentMember.role === "owner" && currentMember.id !== member.id && (
                              <Button size="sm" variant="destructive">Kick</Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}
