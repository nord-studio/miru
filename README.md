# 見る (Miru)

A free, open-source and fully customisable status page and monitoring service.

## TODO:

-   [x] Workspaces
    -   [x] Create default on register
    -   [x] Settings
-   [x] Monitors
    -   [x] CRUD Operations
    -   [x] Cron Jobs
    -   [x] Ping logs
-   [ ] Incidents
    -   [x] CRUD Operations
    -   [ ] Auto create on monitor downtime
    -   [ ] RSS Feed
    -   [ ] Atom Feed
-   [x] Incident Reports
    -   [x] CRUD Operations
-   [ ] Onboarding
    -   [ ] Standalone / Multi-tenant
-   [ ] Status Pages
    -   [ ] CRUD Operations
    -   [ ] Multiple domain assignment
    -   [ ] Brand Theming
-   [ ] Notification Channels
    -   [ ] CRUD Operations
    -   [ ] Discord
    -   [ ] Email
    -   [ ] Slack
-   [ ] Settings
    -   [x] General Settings
    -   [ ] Team
    -   [ ] API Tokens

## Tech stack

-   Framework: [NextJS](https://nextjs.org/)
-   Deployment: [Hetzner](https://www.hetzner.com/cloud/)
-   UI: [shadcn/ui](https://ui.shadcn.com/)
-   Styling: [TailwindCSS](https://tailwindcss.com/)
-   Database: [PostgreSQL](https://www.postgresql.org/)
-   ORM: [Drizzle](https://orm.drizzle.team/)

## Project Structure

-   [@miru/web](./apps/web) - The control plane, powered by [NextJS](https://nextjs.org/).
-   [@miru/monitor](./apps/monitor/) - The service monitoring service, powered by [Rust](https://www.rust-lang.org/).
-   [@miru/docs](./apps/docs/) - The documentation site, powered by [Astro](https://astro.build/) using the [Starlight](https://starlight.astro.build/) template.

## Running locally

You need to have [NodeJS](https://nodejs.org/en), [pnpm](https://pnpm.io/), [Rust](https://www.rust-lang.org/), and [watchexec](https://github.com/watchexec/watchexec) installed as prerequisites.

```bash
git clone https://github.com/nord-studio/miru
cd miru
pnpm install
# Create and setup your .env file using the .env.example file before this command
pnpm dev
```

## Contact

If you need to contact me, please send inquires via email: **hi at tygr dot dev**.
