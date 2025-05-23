import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { Plus, UserPlus } from "lucide-react";
import { eq } from "drizzle-orm";
import InviteMembers from "@/components/settings/team/invite-members";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateInviteToken from "@/components/settings/team/create-invite";
import { getAppUrl } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/app/admin/[workspaceSlug]/settings/team/columns";

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

  const currentMember = members.find(
    (member) => member.userId === currentUser.user.id,
  );

  if (!currentMember) {
    throw new Error("You are not a member of this workspace");
  }

  const moreThanOneOwner =
    members.filter((member) => member.role === "owner").length > 1;

  const { appUrl } = getAppUrl();

  return (
    <>
      <main className="flex flex-col gap-4 w-full">
        <div className="flex flex-row gap-4 items-center w-full">
          <div className="flex flex-col w-full">
            <h1 className="text-3xl font-black font-display">{workspace.name}&apos;s Team</h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage your team members and their roles in this workspace.
            </p>
          </div>
          {currentMember.role !== "member" && (
            <>
              <div className="md:flex flex-row gap-3 hidden">
                <CreateInviteToken
                  workspace={workspace}
                  appUrl={appUrl}
                  currentMember={currentMember}
                >
                  <Button variant="outline">
                    <Plus />
                    Create Invite
                  </Button>
                </CreateInviteToken>
                <InviteMembers
                  workspace={workspace}
                  members={members}
                  currentMember={currentMember}
                >
                  <Button>
                    <UserPlus />
                    Invite Member
                  </Button>
                </InviteMembers>
              </div>
              <div className="flex flex-row gap-3 md:hidden">
                <CreateInviteToken
                  workspace={workspace}
                  appUrl={appUrl}
                  currentMember={currentMember}
                >
                  <Button size="icon" variant="outline">
                    <Plus />
                  </Button>
                </CreateInviteToken>
                <InviteMembers
                  workspace={workspace}
                  members={members}
                  currentMember={currentMember}
                >
                  <Button>
                    <UserPlus />
                    Invite
                  </Button>
                </InviteMembers>
              </div>
            </>
          )}
        </div>
        <div>
          <DataTable data={members.map((member) => {
            return {
              ...member,
              currentMember,
              workspace,
              moreThanOneOwner,
            }
          })} columns={columns} />
        </div>
      </main>
    </>
  );
}
