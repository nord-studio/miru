![banner](/assets/banner.png)

# What is Miru?

Miru is a free and open-source status page and monitoring service built to be self-hosted.

## Getting started

To deploy your own instance of Miru, make sure you have Docker and the compose plugin installed.  
Either clone the repo, or copy and paste the [`docker-compose.yml`](./docker-compose.yml) file, then run:

```bash
docker compose up -d
```

Navigate to `http://localhost:3000` and you're done!

## Running locally

You need to have [NodeJS](https://nodejs.org/en), [pnpm](https://pnpm.io/), [Rust](https://www.rust-lang.org/), and [watchexec](https://github.com/watchexec/watchexec) installed as prerequisites.

```bash
git clone https://github.com/nord-studio/miru
cd miru
pnpm install
docker compose up -d database
# Create and setup your .env file using the .env.example file before these commands
pnpm drizzle migrate
pnpm dev
```

## Support

Miru is built by [@tygrdotdev](https://github.com/tygrdotdev) in their spare time for completely free. If you use Miru and want to support an indie dev, please consider sponsoring me and my work [here](https://github.com/sponsors/tygrdotdev).

## Contact

If you need to contact me, please send inquires via email: **hi at tygr dot dev**.
