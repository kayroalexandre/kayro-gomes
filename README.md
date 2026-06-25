# kayro-gomes — Portfólio Pessoal

Site oficial e portfólio de **Kayro Gomes** (kayroalexandre), construído com **Next.js 16 + Payload CMS 3**.

🌐 **Produção:** [www.kayrogomes.com](https://www.kayrogomes.com)

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Payload CMS 3** (rodando no mesmo processo Next)
- **Postgres** (Docker local para dev; Neon em produção)
- **Vercel Blob Storage** para mídia
- **Vercel** para deploy (Production + Preview)

## Desenvolvimento Local

### Pré-requisitos

- Bun 1.3.x
- Docker Desktop (para Postgres local na porta 54320)
- Vercel CLI (`npm i -g vercel`)

### Setup

```bash
# 1. Clone e instale dependências
git clone https://github.com/kayroalexandre/kayro-gomes.git
cd kayro-gomes
bun install

# 2. Inicie o Postgres local via Docker
docker compose up -d

# 3. Rode o servidor de desenvolvimento (predev roda design:build + ensure-db.sh)
bun dev

# 4. Acesse http://localhost:3000
```

### Comandos Úteis

```bash
bun run lint                 # ESLint (--max-warnings 0)
bunx tsc --noEmit            # Typecheck
bun run build                # Build de produção (prebuild: design:build + migrate)
bun payload migrate          # Aplicar migrations
bun generate:types           # Regerar tipos Payload
bun db:seed                  # Popular banco (DESTRUTIVO — nunca em prod)
bun run design:build         # Compilar tokens DTCG → tokens.css + motion
```

## Workflow de Desenvolvimento

Consulte [`AGENTS.md`](AGENTS.md) para o workflow oficial consolidado:

- **Branches permanentes:** `main` (produção, protegida), `develop` (trabalho principal), `preview` (testes temporários)
- **Commits diretos** permitidos em `develop` e `preview`
- **PRs para `main`** exigem aprovação + CI verde (lint, typecheck, tests, build)
- **Migrations:** `bun payload migrate:create` (nunca edite migrations aplicadas)
- **Design tokens:** edite JSON em `src/design-system/tokens/*.json`, rode `bun run design:build`

## Documentação

- [`AGENTS.md`](AGENTS.md) — Workflow oficial, regras de IA, fluxo de 3 branches, hero geometry
- [`CLAUDE.md`](CLAUDE.md) — Guia para Claude Code (resumo de comandos e arquitetura)
- [`docs/MIGRATIONS.md`](docs/MIGRATIONS.md) — Fluxo de migrations e arquitetura de bancos
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — Catálogo de erros comuns
- [`docs/DESIGN-SYSTEM-GOVERNANCE.md`](docs/DESIGN-SYSTEM-GOVERNANCE.md) — Governança do design system
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — Contrato de consumo (vocabulário canônico)
- [`docs/DESIGN-SYSTEM-COMPONENTS.md`](docs/DESIGN-SYSTEM-COMPONENTS.md) — Catálogo de componentes + receitas
- [`docs/DESIGN-SYSTEM-LAYOUT.md`](docs/DESIGN-SYSTEM-LAYOUT.md) — Estrutura, espaçamento e auditoria de layout
- [`docs/workflow_guide.md`](docs/workflow_guide.md) — Guia legado (consulte AGENTS.md)

## Segurança

- **NUNCA** commite `.env.local`, `.env.docker`, ou qualquer arquivo com secrets
- Use `vercel env pull` para gerar `.env.local` em qualquer máquina
- Para Postgres local, use **apenas** `.env.docker`
- O seed (`bun db:seed`) é **destrutivo** — nunca rode em produção sem backup
- Senha do seed demo: defina `PAYLOAD_DEMO_USER_PASSWORD` em env (nunca hardcode)

## Licença

MIT

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Posts

  Posts are used to generate blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Categories

  A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/plugins/nested-docs) for more details.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

  The data required by the header on your front-end like nav links.

- `Footer`

  Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- `users`: Users can access the admin panel and create or edit content.
- `posts`: Everyone can access published posts, but only users can create, update, or delete them.
- `pages`: Everyone can access published pages, but only users can create, update, or delete them.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/lexical/overview) docs.

## Draft Preview

All posts and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with `drafts` set to `true`. This means that when you create a new post, project, or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, posts, and projects will need to be regenerated as changes are made to published documents. To do this, we use an `afterChange` hook to regenerate the front-end when a document has changed and its `_status` is `published`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/main/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## On-demand Revalidation

We've added hooks to collections and globals so that all of your pages, posts, footer, or header changes will automatically be updated in the frontend via on-demand revalidation supported by Nextjs.

> Note: if an image has been changed, for example it's been cropped, you will need to republish the page it's used on in order to be able to revalidate the Nextjs image cache.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template also pre-configured with the official [Payload Search Plugin](https://payloadcms.com/docs/plugins/search) to showcase how SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the `redirects` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Jobs and Scheduled Publish

We have configured [Scheduled Publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish) which uses the [jobs queue](https://payloadcms.com/docs/jobs-queue/jobs) in order to publish or unpublish your content on a scheduled time. The tasks are run on a cron schedule and can also be run as a separate instance if needed.

> Note: When deployed on Vercel, depending on the plan tier, you may be limited to daily cron only.

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload/tree/main/packages/admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Fully featured blog
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Redirects
- Live preview

## Development

To spin up this example locally, follow the [Quick Start](#quick-start). Then [Seed](#seed) the database with a few pages, posts, and projects.

### Working with Postgres

Postgres and other SQL-based databases follow a strict schema for managing your data. In comparison to our MongoDB adapter, this means that there's a few extra steps to working with Postgres.

Note that often times when making big schema changes you can run the risk of losing data if you're not manually migrating it.

#### Local development

Ideally we recommend running a local copy of your database so that schema updates are as fast as possible. By default the Postgres adapter has `push: true` for development environments. This will let you add, modify and remove fields and collections without needing to run any data migrations.

If your database is pointed to production you will want to set `push: false` otherwise you will risk losing data or having your migrations out of sync.

#### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) are essentially SQL code versions that keeps track of your schema. When deploy with Postgres you will need to make sure you create and then run your migrations.

Locally create a migration

```bash
bun payload migrate:create
```

This creates the migration files you will need to push alongside with your new configuration.

On the server after building and before running `bun start` you will want to run your migrations

```bash
bun payload migrate
```

This command will check for any migrations that have not yet been run and try to run them and it will keep a record of migrations that have been run in the database.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, posts, and projects you can click the 'seed database' link from the admin panel.

> ⚠️ **SECURITY:** The seed creates a demo user. **Never hardcode passwords.** Set `PAYLOAD_DEMO_USER_PASSWORD` in your environment (`.env.local` or Vercel). If not set, a safe fallback is used. See `AGENTS.md` for details.
>
> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
