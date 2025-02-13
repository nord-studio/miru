# Iris

A free, open-source and fully customisable status page and monitoring service.

## Tech stack

-   Framework: [NextJS](https://nextjs.org/)
-   Deployment: [Hetzner](https://www.hetzner.com/cloud/)
-   UI: [shadcn/ui](https://ui.shadcn.com/)
-   Styling: [TailwindCSS](https://tailwindcss.com/)
-   Database: [LibSQL](https://github.com/tursodatabase/libsql)
-   ORM: [Drizzle](https://orm.drizzle.team/)
-   Hotel? [Travago](https://youtu.be/fkFzrww5dW8?t=1)

## Project Structure

-   [@iris/web](./apps/web) - The control plane, powered by [NextJS](https://nextjs.org/).
-   [@iris/monitor](./apps/monitor/) - The service monitoring service, powered by [Rust](https://www.rust-lang.org/).
-   [@iris/docs](./apps/docs/) - The documentation site, powered by [Astro](https://astro.build/) using the [Starlight](https://starlight.astro.build/) template.

## Running locally

You need to have [NodeJS](https://nodejs.org/en), [pnpm](https://pnpm.io/), [Rust](https://www.rust-lang.org/), and [watchexec](https://github.com/watchexec/watchexec) installed as prerequisites.

```bash
git clone https://github.com/nord-studio/iris
cd iris
pnpm install
# Create and setup your .env file using the .env.example file before this command
pnpm dev
```

## Contact

If you need to contact me, please send inquires via email: **hi at tygr dot dev**.
