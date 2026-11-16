import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import type { RequiredDataFromCollectionSlug } from 'payload'
import approvedHome from '../../content/home-approved.json'

/** One-time publication of the home approved by the owner; never a runtime seeder. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const context = { disableRevalidate: true }
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    depth: 0,
    limit: 1,
    draft: true,
    overrideAccess: true,
    req,
  })
  const current = result.docs[0]
  if (current) {
    const isOriginal =
      current._status === 'published' &&
      current.hero.type === 'lowImpact' &&
      String(JSON.stringify(current.hero.richText)).includes('Building reliable platforms')
    if (!isOriginal) {
      payload.logger.info('Approved home migration: existing personal/custom home preserved.')
      return
    }
    // Persist the original document in Payload Versions before replacing its content.
    await payload.update({
      collection: 'pages',
      id: current.id,
      data: { title: current.title },
      draft: false,
      overrideAccess: true,
      context,
      req,
    })
    await payload.update({
      collection: 'pages',
      id: current.id,
      data: approvedHome as RequiredDataFromCollectionSlug<'pages'>,
      draft: false,
      overrideAccess: true,
      context,
      req,
    })
  } else {
    await payload.create({
      collection: 'pages',
      data: approvedHome as RequiredDataFromCollectionSlug<'pages'>,
      draft: false,
      overrideAccess: true,
      context,
      req,
    })
  }

  const header = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true, req })
  const defaultMenu =
    !header.navItems?.length ||
    header.navItems.every(({ link }) => ['home', 'início'].includes(link.label.toLowerCase()))
  if (defaultMenu) {
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Início', url: '/' } },
          { link: { type: 'custom', label: 'Vídeos', url: '/#videos' } },
          { link: { type: 'custom', label: 'Sobre', url: '/#sobre' } },
        ],
      },
      overrideAccess: true,
      context,
      req,
    })
  }
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true, req })
  if (!footer.navItems?.length) {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'GitHub',
              url: 'https://github.com/juniorhova',
              newTab: true,
            },
          },
          {
            link: {
              type: 'custom',
              label: 'LinkedIn',
              url: 'https://www.linkedin.com/in/airtonhovajunior/',
              newTab: true,
            },
          },
        ],
      },
      overrideAccess: true,
      context,
      req,
    })
  }
  payload.logger.info(
    'Approved personal home published; unrelated content and custom navigation preserved.',
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error(
    'Restore the previous home through Payload Versions, or unpublish the created home, before manually reverting this content migration. Automatic rollback must not overwrite subsequent editorial changes.',
  )
}
