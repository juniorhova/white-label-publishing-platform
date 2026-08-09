# AGENTS.md

## Project

This repository contains personal portfolio and technical blog application.

The first product is a focused, single-user publishing website. It uses Payload
CMS for content administration and a custom public website for visitors.

The project may later evolve into a white-label SaaS, but future SaaS
capabilities are not part of the current MVP.

## Current objective

Build a locally running MVP that allows Airton to:

1. Sign in through Payload's standard administration interface.
2. Create and edit technical posts.
3. Save posts as drafts.
4. Keep draft content inaccessible from the public website.
5. Publish posts.
6. View published posts on the public blog.
7. Manage portfolio projects and basic site content.
8. Run and verify the application locally through documented commands.

The public portfolio and blog should be professional, responsive, accessible,
and suitable for recruiters, employers, technical readers, and prospective
consulting clients.

## Initial stack

The expected MVP stack is:

- Next.js
- TypeScript with strict mode
- Payload CMS
- PostgreSQL
- Tailwind CSS
- pnpm
- Docker Compose for local PostgreSQL
- Vitest where unit or integration tests add value
- Playwright for essential browser workflows

Use current primary documentation when selecting versions or implementing
framework-specific behavior.

## Payload-first rule

Payload is the CMS and administration system.

Before creating any CMS or administration feature, verify whether Payload
already provides it. Use Payload's built-in feature when it satisfies the
requirement.

Preserve the standard Payload admin experience.

Do not replace or redesign:

- The Payload admin layout
- The Payload admin navigation
- Collection list screens
- Collection edit screens
- The authentication interface
- The rich-text editor
- The media library
- Draft and publish controls
- The default CMS dashboard
- Built-in document controls

Any custom admin/public component requires a documented reason and approval before
implementation.

## MVP content model

Start with only the content required by the public portfolio and blog:

- Users
- Posts
- Categories
- Tags
- Media
- Projects
- Basic site settings

Do not create generic platform entities without an active MVP requirement.

Do not create tenants, organizations, memberships, subscriptions, plans,
domains, template registries, feature entitlements, or billing entities.

## Public website scope

The custom public website may include:

- Home page
- About or portfolio page
- Experience and skills content
- Projects listing
- Blog listing
- Individual article page
- Category or tag filtering
- Contact and professional profile links
- Responsive navigation
- SEO metadata
- Sitemap

Only the public website should receive custom visual design after a discussion about it.

Final colors, typography, and detailed layout may be decided during the public
UI phase. The lack of final branding must not block CMS or content-model work.

## Deferred scope

Do not implement the following during this MVP:

- Custom Payload admin design
- Custom CMS dashboard
- Custom authentication UI
- Custom rich-text editor
- Custom media management
- Custom Multi-author editorial workflow
- Custom Reviewer or approval roles
- Custom Multi-tenancy
- Custom Tenant isolation architecture
- Custom Tenant memberships
- Custom Customer onboarding
- Custom Team invitations
- Custom White-label template engine
- Custom Customer-facing theme editor
- Custom Drag-and-drop page builder
- Custom Restaurant or coffee-shop content models
- Custom domain automation
- Custom Reader accounts
- Custom Comments
- Custom Reactions
- Custom Bookmarks
- Custom Memberships
- Custom Private or paid content
- Custom Billing
- Custom Subscription plans
- Custom Usage quotas
- Custom AI writing features
- Custom Semantic search
- Kubernetes
- Microservices
- Message queues
- Production Terraform
- Multi-region infrastructure
- Advanced observability platforms

These items may be recorded in a short Future Direction section, but they must
not create MVP requirements, abstractions, or implementation phases.

## Architecture

Start as a modular monolith using Next.js and Payload in the architecture
recommended by Payload.

The application contains:

- A custom public Next.js website
- The standard Payload admin interface
- Payload server-side functionality
- PostgreSQL as the system of record

Do not split the frontend and CMS into separate deployable applications during
the MVP unless a reviewed requirement demonstrates that it is necessary.

Do not introduce microservices.

## Development approach

Use GSD for the project workflow.

For each phase:

1. Discuss the phase.
2. Define the exact outcome.
3. Write measurable acceptance criteria.
4. Produce a focused implementation plan.
5. Review the plan before execution.
6. Implement only the approved scope.
7. Run applicable verification.
8. Explain the important changes.
9. Review the Git diff.
10. Commit a focused checkpoint.

The MVP roadmap should contain no more than six implementation phases unless
the project owner explicitly approves additional phases.

Prefer approximately:

1. Official Payload application foundation and PostgreSQL
2. Minimal CMS collections and publishing access rules
3. Public blog pages
4. Public portfolio pages and responsive design
5. Essential testing and security validation
6. Local documentation and final MVP verification

Do not create phases for future SaaS functionality.

## Change control

Before modifying files:

- Read this file.
- Read the active GSD requirements and phase plan.
- Inspect the existing implementation.
- State material assumptions.
- Keep changes limited to the current phase.

Do not modify unrelated files.

Do not broaden the task because a future capability could theoretically benefit
from it.

When there is a conflict between current MVP simplicity and speculative future
flexibility, prefer the simplest correct MVP implementation unless it creates
an obvious irreversible limitation.

## Dependency policy

Before adding a significant dependency:

1. Explain the requirement it addresses.
2. Check whether Next.js, Payload, Node.js, or the current stack already
   provides the capability.
3. Avoid overlapping frameworks and UI libraries.
4. Prefer actively maintained packages.
5. Add only what the current phase needs.

Do not install packages during requirements or roadmap planning.

## Security baseline

For the MVP, implement and verify:

- Payload-supported authentication
- EntraID SSO Authentication (keeping both authentication methods available on admin page)
- Secure secret handling
- Draft content excluded from public queries
- Explicit public versus authenticated access rules
- Input validation through Payload fields and application boundaries
- Safe rich-text rendering
- Media type and size restrictions where supported and required
- Environment-variable validation
- No secrets committed to Git
- Safe error handling
- Appropriate security headers
- Dependency review
- Tests for critical authorization behavior

Do not build a large custom security framework.

## Testing baseline

The critical browser workflow is:

1. User signs in through the standard Payload admin.
2. User creates a draft post.
3. The draft cannot be accessed publicly.
4. User publishes the post.
5. The post appears in the public blog.
6. User edits the post.
7. The public article reflects the published update.

Add focused tests for:

- Public post queries
- Draft exclusion
- Published article rendering
- Essential navigation
- Important access-control behavior

Do not create a large testing framework before there is behavior to test.

## Documentation

Keep documentation practical and current.

The README should eventually explain:

- Prerequisites
- Environment variables
- Installation
- Starting PostgreSQL
- Starting the application
- Database migrations
- Initial administrator creation
- Seeding where applicable
- Running tests
- Building the application
- Troubleshooting common local issues

Do not document commands that do not exist.

## Git

Use small, reviewable commits.

Before declaring a phase complete:

- Run applicable formatting
- Run linting
- Run type checking
- Run relevant tests
- Run the production build where applicable
- Review `git status`
- Review the diff
- Confirm no secrets or runtime data are included
- Update documentation

Do not commit automatically unless the user explicitly authorizes it.

## Definition of MVP completion

The MVP is complete when:

- The application runs locally using documented steps.
- PostgreSQL is available through the documented local setup.
- User can sign in through the standard Payload admin interface.
- User can create, edit, draft, publish, and unpublish posts.
- Draft posts are not publicly accessible.
- Published posts appear on the public website.
- Portfolio projects can be managed through Payload.
- The public site is responsive and accessible at a practical baseline.
- Essential tests pass.
- The application builds successfully.
- The setup and publishing workflow are documented.
- Payload's standard admin experience remains intact.

## Production Environment ##

The production environment will run through Coolify self-hosted platform, having both application and postgres deployed by Coolify.
