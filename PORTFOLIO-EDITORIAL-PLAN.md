# Portfolio and editorial evolution — proposed for review

Date: 2026-11-15. Current delivery: approved personal home on `feat/home-design`, including the two videos, short biography, experience timeline, 24-week DevOps roadmap with official topic links, and JH favicon. Posts/Resources remain deferred. Commit, push and PR to main were explicitly authorized in the chat after local approval; merge and production deployment are not authorized. Earlier branch names and pending-approval descriptions below are historical proposal context.
Branch: `feat/portfolio-blog-resources`. Base: `f1ab5841549487f7fe1d143d60b89f82292a3ef8`.
Remote main was fetched and matches this base. No application changes, commits, push or production actions.

## Audit and assumptions

- Read root and application AGENTS.md, PROJECT-BRIEF.md and PROJECT-STATUS.md, and the two supplied context documents. No GSD requirements/roadmap/phase files or `.agents/skills/payload/SKILL.md` were found in the available workspace. They have not been read. This plan proposes a focused replacement for this change only, without claiming to reconstruct the original roadmap.
- Keep Next 16.2.6, Payload 3.86.0, PostgreSQL and native admin. Existing Pages, Posts, Media, Categories, Header/Footer globals, Lexical and content blocks are reusable. There is no dedicated Projects collection; do not create one merely to match the brief. Reuse Pages for existing portfolio content.
- Posts and Pages already configure drafts, autosave, versions and previews. Public listing uses `overrideAccess: false`; read access filters anonymous callers to published documents. Detail queries disable access override outside draft mode. This is code evidence, not proof that the complete editorial flow works.
- Preview entry checks the secret and authenticated user. Review session expiration and all draft-mode readers before relying on access override; validate the preview destination as a local path.
- Blog routes are `/posts`, `/posts/[slug]`, `/posts/page/[pageNumber]`. There is no dedicated `/blog` listing in the inspected code; a CMS page with that slug could exist, but no production data was read.
- Article hero uses an 80vh image area with overlaid white text. Metadata includes Payload template branding. Header/footer navigation comes from CMS globals.
- Media reads are public, mutations require an authenticated user, and files are stored in `public/media`. No explicit MIME whitelist or size ceiling was found. A draft page does not make its media private.
- Existing browser tests cover admin navigation, not draft → publish → update. The API integration test only fetches users. No tests or application runtime have been run during this audit.
- Docker startup runs `pnpm migrate && pnpm start`. Future deployment needs deliberate migration review. Do not start this production image against production during this work.

## Proposed visual direction for approval

Preserve the existing logo, verified biography, links and portfolio content. English remains the site default. Use the existing font and theme system, a neutral background, clear text contrast, restrained borders and one existing accent. No new design dependency.

- Desktop: compact header with logo and Home / Blog / Resources / existing professional links; clear introductory heading, short biography and existing portfolio content. Remove template copy without replacing it with invented claims.
- Mobile: navigation wraps or uses an accessible compact menu only if required by available space; no horizontal overflow at 375px.
- Blog: title, short factual introduction, editorial article list with title, description and available publication metadata. An honest empty state replaces sample posts.
- Article: title above an optional image, byline/date, body around 68 characters wide, approximately 18–20px text and generous line height; responsive headings, bounded images, horizontally scrollable code. No hero image required for legibility.
- Resources: title, short introduction, language labels, published material cards. Individual existing CMS Pages hold the introduction and selectable prompt text, with a download only when a real public file exists. Portuguese materials identify their language and set the page language appropriately.

## Focused implementation plan and reasons

1. Keep `/posts`, `/posts/[slug]` and `/posts/page/[pageNumber]` canonical, per the owner’s latest direction. The navigation label may be Blog. Add compatibility redirects from `/blog` only after checking for existing CMS page conflicts. Keep preview, SEO, sitemap, search and revalidation aligned. No CMS content deletion.
2. Apply the approved public visual direction to existing public components and remove template metadata. Review draft metadata and public related-post/search/sitemap queries for leaks.
3. Reuse Pages for resource presentation: add optional resource classification/language/summary and an attachment relationship only where needed. Render `/resources` from published classified Pages; keep individual Pages at their existing stable `/<slug>` URLs. Reserve `/resources` and `/posts` from conflicting page slugs with a documented compatibility check.
4. Reuse Media for explicitly public attachments. Add optional title/description/language and a clear public-file notice. Restrict new uploads to JPEG, PNG, WebP and PDF; propose a 20 MiB request/file ceiling and validate file signatures for allowed types. Preserve existing media records without an automatic destructive conversion. Review any incompatible existing references locally before changes.
5. Add a minimal public download presentation using the attachment relation; this custom component is needed to avoid hand-entered or nonexistent file URLs. Reuse existing code/text rendering for prompts; inspect the existing code copy control before adding any custom copy button. No new collection or admin screen.
6. Configure an explicit persistent upload directory outside Next's public static directory, served through Payload with public access for Media. Require a persistent directory configuration in production to prevent silent ephemeral uploads. Document a future volume mounted at `/app/uploads`, writable by UID/GID 1001, and the separate backup requirement. Existing files need a reviewed copy step before switching storage paths. No actual host configuration, file migration or production access in this session.

All Media remains deliberately public, including files referenced only by drafts. Only approved public files should be uploaded. Private notes and unapproved guide content stay outside the CMS. Stable file URLs last while the file record is retained; publish a new version as a new file rather than replacing/deleting a distributed attachment.

## Acceptance criteria and verification

- Work stays on this feature branch; native admin and current stack remain intact.
- Fresh isolated local PostgreSQL and fictional clearly marked fixtures only. No production environment files or credentials.
- Admin workflow: sign in, create draft, save, preview while authenticated, verify anonymous URL/API/search/sitemap exclusion, publish, verify listing/article, update and republish, unpublish and verify exclusion. Include an expired/absent admin session for previews.
- Resources: draft excluded, published page and real PDF download accessible anonymously, no missing-file button, language visible, anonymous create/update/delete rejected. Validate wrong MIME, signature mismatch and oversized uploads.
- Desktop/mobile browser review at 1440px and 375px: keyboard navigation, readable articles with and without hero image, code overflow, images and download behavior.
- Generate Payload types/import map and a reviewed schema migration if needed. Apply migration only to disposable local database.
- Run formatting, `pnpm lint`, TypeScript check, relevant integration/browser tests and `pnpm build`; review diff/status for secrets and runtime artifacts. Report unavailable checks honestly.
- Write practical admin instructions and storage/migration/deployment checklist. No guide PDF generation, approved guide publication, automatic commit, push, merge, deployment or Coolify access.

## Decision required

Approve this implementation plan, public visual direction, optional Pages/Media fields and minimal public resource/download component. This is required by root AGENTS.md: “Review the plan before execution” and “Any custom admin/public component requires a documented reason and approval before implementation.” PROJECT-BRIEF.md also says not to implement until revised requirements and roadmap have been reviewed.

## Official references consulted

- https://payloadcms.com/docs/access-control/overview
- https://payloadcms.com/docs/versions/drafts
- https://payloadcms.com/docs/upload/overview
- https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects


## Engineering and UX refinement — 2026-11-15

The owner requested combined software engineering and UI/UX responsibility. This refines the proposal; implementation approval remains pending under AGENTS.md.

### Confirmed implementation findings

- LowImpactHero accepts rich text but does not render the configured hero links. Editing links alone cannot produce the proposed paired hero actions in that variant.
- ContentBlock constructs Tailwind column-span classes dynamically. Replace these with complete literal classes so generated CSS reliably contains each supported width; verify the actual build before calling this the cause of any screenshot behavior.
- RenderBlocks wraps each block in `my-16`, while ContentBlock adds its own `my-16`. Inspect and consolidate section spacing rather than requiring editors to compensate with content.
- The Code block already includes a CopyButton. Reuse it for appropriate text/code and verify plain-text behavior before proposing another copy implementation.
- The screenshot biography is authored as a heading. New structured introduction fields should render description text as a paragraph, preventing visual and semantic misuse of headings.

### Concrete first implementation slice for review

1. Add one optional `portfolio` hero variant to the existing hero group, preserving existing variants and stored content. Native fields: short identity/role label, required plain-text heading, plain-text introduction and up to two links using the existing link group. No portrait. Explicit fields keep title and description semantics consistent without a custom editor.
2. Public hero: maximum content width around 1120px; heading approximately 40–64px on desktop and 32–40px on mobile, responsive rather than fixed line breaks; description 18–20px with comfortable line height and maximum width around 65 characters. Two compact actions wrap on narrow screens. Do not assume line counts independently of actual text.
3. Reuse Archive for recent published posts; adjust its public presentation and query access as needed. Add only one curated work block if existing Content/links cannot represent real work clearly: section heading plus up to three entries with title, summary and existing page/external link. No new Projects collection, metrics or fabricated case studies.
4. Improve the existing article template at `/posts/[slug]`: title/byline above optional image, readable body around 68 characters wide, predictable heading rhythm, responsive images and scrollable code. Keep native Lexical with existing blocks; article authors should not assemble the page layout.
5. Verify the first slice visually using fictional local content before expanding Resources. Existing stored pages remain unchanged; demonstrate the new hero locally and document how to select it in Pages → Hero. No automatic rewriting of production content.

Reason for the custom hero: the existing rich-text variant does not enforce the intended hierarchy or display configured actions. Reason for a curated work block, if required: consistent structured entries without forcing the editor to manually format repeated columns. Both remain native Payload field configurations with public React renderers.

Approval requested for this first slice: portfolio hero, conditional curated work block, existing-block fixes and article template design. This is a focused subset of the broader editorial/resources plan, not authorization to publish or change hosting.


## Updated language direction

The owner explicitly changed the public site language to Brazilian Portuguese in the chat. This supersedes the earlier English-first requirement. Navigation, presentation, public labels and new editorial content should use Portuguese; keep `/posts` URLs. The current visual proposal was translated for review. Existing production content has not been rewritten and the Payload admin has not been replaced or translated in this step.


## Current visual selection

Owner preferred the first (personal) proposal with a vertical portrait and rejected the green palette. Refine that composition using warm light neutrals and graphite; a real natural-color portrait remains to be selected. This updates the visual proposal only, not production content.

Typography decision: owner requested the reference site’s text font. Browser-computed styles on yudiganeko.com confirmed Geist Mono (body 15–16px/400, name 30px/400, section headings 24px/700). Apply Geist Mono to the personal proposal, keeping the neutral palette and vertical portrait direction. The application already includes the Geist package; no stack replacement is needed.


## Approved personal home implementation

Owner approved the personal composition in Portuguese with a vertical supplied portrait, Geist Mono, blue accent #2946A3 and social platform colors. Owner supplied YouTube video Pmywg8y43j0 and LinkedIn airtonhovajunior. Implemented on feat/home-design using existing Hero/Media/Content and native admin fields. YouTube title/thumbnail use server-side oEmbed; playback uses an on-demand embedded player. No Resources, production changes, push or commit. See white-label-publishing-platform/docs/home-introduction.md for verification and editing instructions.


## Visual fidelity correction and actual content

Owner reported mismatch with the approved proposal and clarified there are no published projects, only two videos. Replace Projects with Videos, keep the approved photo/font/blue palette, restore compact two-column featured video, native Content card/about appearances, consistent type and a light footer. The second supplied video is Pre9fPpfrGQ. No fabricated projects or metrics. All work remains on feat/home-design and isolated local databases.
