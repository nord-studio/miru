![banner](/assets/banner.png)

# What is Miru?

Miru is a free, open-source and fully customisable status page and monitoring service built with Rust and Next.js. It was built to provide a simple and easy way to monitor your services like websites, APIs, dependency sites, and more.

Miru is designed to be local-first, meaning it can be run entirely on your own server in just a few minutes.

## Getting started

There are multiple ways you can install and setup your own Miru instance. The links below rank the installation methods from easiest to hardest.

-   [Docker Compose](https://miru.nordstud.io/docs/install/docker-compose)
-   [Docker](https://miru.nordstud.io/docs/install/docker)

## Documentation

For more information about Miru, getting started guides, configuration guides, and more, please see our [documentation](https://miru.nordstud.io/docs).

## Running locally

You need to have [NodeJS](https://nodejs.org/en), [pnpm](https://pnpm.io/), [Rust](https://www.rust-lang.org/), and [watchexec](https://github.com/watchexec/watchexec) installed as prerequisites.

```bash
git clone https://github.com/nord-studio/miru
cd miru
pnpm install
docker compose up -d database minio
# Create and setup your .env file using the .env.example file before these commands
pnpm drizzle migrate
pnpm dev
```

## Support

Miru is built by [@tygrdotdev](https://github.com/tygrdotdev) in their spare time for completely free. If you use Miru and want to support an indie dev, please consider sponsoring me and my work [here](https://github.com/sponsors/tygrdotdev).

## Contact

If you need to contact me, please send inquires via email: **hi at tygr dot dev**.
