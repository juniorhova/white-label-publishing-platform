# White Label Portfolio and Technical Blog

A personal portfolio and technical publishing website built with Next.js,
Payload CMS, TypeScript, and PostgreSQL.

## GitHub repository description

A personal portfolio and technical blog built with Next.js, Payload CMS,
TypeScript, and PostgreSQL for publishing DevOps, Cloud, Platform Engineering,
and AI content.

## Current status

The current stage is requirements and roadmap planning. Application
implementation should not begin until the revised GSD requirements and roadmap
have been reviewed.

## MVP goal

The MVP will provide:

- A professional public portfolio
- A technical blog
- Payload's standard CMS administration interface
- Draft and published posts
- Categories and tags
- Media management
- Portfolio projects
- Basic site settings
- A responsive and accessible public interface
- A documented local development workflow
- Essential automated verification


## Core publishing workflow

The MVP must support this complete workflow:

1. User signs in through Payload's standard admin interface.
2. User creates a technical article.
3. User saves it as a draft.
4. The draft remains inaccessible to public visitors.
5. User publishes the article.
6. The article appears on the public blog.
7. User edits and republishes the article.

## Technical direction

The expected stack is:

- Next.js
- TypeScript
- Payload CMS
- PostgreSQL
- Tailwind CSS
- pnpm
- Docker Compose for local PostgreSQL
- Vitest
- Playwright

The project will begin as a modular monolith.

Payload will provide the CMS administration interface, authentication, content
editing, drafts, media management, and collection administration.


## Payload administration policy

The standard Payload administration interface must be preserved.

The MVP will configure Payload through collections, fields, globals, access
rules, drafts, media, and preview behavior.

It will not replace Payload's:

- Admin layout
- Navigation
- Authentication interface
- Collection screens
- Rich-text editor
- Media library
- Draft controls
- Default administration experience

## MVP scope

The initial CMS content model is the built-in from Payload.

The initial public interface may include:

- Home
- About or portfolio
- Projects
- Blog
- Article pages
- Category or tag filtering
- Contact links
- Basic SEO metadata
- Sitemap

## Deferred product direction

The project may later evolve into a white-label SaaS for professionals,
restaurants, coffee shops, and local businesses.

The following are explicitly deferred:

- Multi-tenancy
- Multiple organizations
- Customer onboarding
- White-label templates
- Customer theme editing
- Custom domains
- Billing
- Memberships
- Reader accounts
- Comments
- Private content
- Multi-author approval workflows
- Restaurant-specific content
- AI features
- Microservices
- Kubernetes
- Production infrastructure automation

Future ideas must not increase the complexity of the personal portfolio/blog
MVP.

## Project workflow

The project uses:

- Codex for repository implementation and review
- GSD Core for requirements, planning, execution, and verification
- Git for checkpoints and recovery

Each phase should follow:

1. Discuss
2. Plan
3. Review
4. Execute
5. Verify
6. Explain
7. Commit

The MVP roadmap should remain small, concise and objective.
implementation phases.

## Repository guidance

Read before changing the repository:

- `AGENTS.md`
- The active GSD requirements
- The active GSD phase plan

## Local development

Local development commands will be documented after the application foundation
phase creates the real project scripts.

Do not rely on commands documented here until they have been implemented and
verified.
