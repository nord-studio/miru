import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getAppUrl } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const domain = decodeURIComponent((await params).domain);

  const statusPage = await db.query.statusPages.findFirst({
    with: {
      statusPageMonitors: {
        with: {
          monitor: true,
        },
      },
    },
    where: sql`(domain = ${domain} OR (root = true AND domain IS NULL))`,
    orderBy: sql`CASE WHEN domain = ${domain} THEN 0 ELSE 1 END`,
  });

  const { appUrl } = getAppUrl();
  const favicon = `${appUrl}/api/assets/${statusPage?.favicon}`;

  if (!statusPage || statusPage.enabled === false) {
    return {
      title: "Miru",
      description:
        "A free, open-source and self hostable status and monitoring service.",
    };
  } else {
    return {
      title: `${statusPage.name} Status`,
      description:
        statusPage.description ??
        `Welcome to ${statusPage.name}'s status page. Real-time and historical data on system performance.`,
      icons: [
        {
          rel: "icon",
          url: statusPage.favicon ? favicon : `${appUrl}/favicon.ico`,
          sizes: "32x32",
          type: "image/vnd.microsoft.icon",
        },
      ],
    };
  }
}

export default async function StatusPageRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { appDomain } = getAppUrl();
  const domain = decodeURIComponent((await params).domain);
  const root = domain === appDomain;

  if (root) {
    const fresh = await db
      .select()
      .from(user)
      .limit(1)
      .then((res) => res.length === 0);

    if (fresh) {
      return redirect("/onboarding");
    }
  }

  return <>{children}</>;
}
