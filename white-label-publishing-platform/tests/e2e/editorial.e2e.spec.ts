import { test, expect } from '@playwright/test'

test('mantém a listagem de artigos dentro da tela no celular', async ({ page }) => {
  test.skip(!test.info().project.use.isMobile, 'Verificação da listagem em telas pequenas.')

  for (const width of [320, 375, 390, 430, 700]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/posts')

    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { name: 'Artigos', exact: true })).toBeVisible()
    await expect(main.getByRole('navigation', { name: 'Categorias' })).toBeVisible()

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `rolagem horizontal do documento em ${width}px`,
    ).toBe(await page.evaluate(() => document.documentElement.clientWidth))

    const columnTracks = await main
      .locator('.editorial-grid')
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns)
    expect(columnTracks).toMatch(/^\d+(?:\.\d+)?px$/)
  }
})

test('importar rascunho, publicar, ler e moderar comentário', async ({
  page,
  request,
  baseURL,
}) => {
  // This test writes fixtures. Never allow it to run against the production site.
  if (!baseURL || !['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname))
    throw new Error('Use somente uma base local descartável.')
  const email = process.env.EDITORIAL_TEST_EMAIL
  const password = process.env.EDITORIAL_TEST_PASSWORD
  if (!email || !password)
    throw new Error(
      'Configure EDITORIAL_TEST_EMAIL e EDITORIAL_TEST_PASSWORD do banco descartável.',
    )
  const login = await request.post('/api/users/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const { token } = await login.json()
  const headers = { Authorization: `JWT ${token}` }
  const slug = `review-${Date.now()}-${test.info().project.name}`
  const input = {
    title: `Revisão ${slug}`,
    slug,
    markdown:
      '## Comece aqui\n\nExplore um pipeline.\n\n{{block:activity}}\n\n## Conclusão\n\nRevise sua entrega.',
    blocks: {
      activity: {
        type: 'pipeline',
        title: 'Pipeline',
        items: [
          { label: 'Teste', explanation: 'Validação automática.' },
          { label: 'Deploy', explanation: 'Entrega validada.' },
        ],
      },
    },
  }
  let id: number | undefined
  try {
    const simulate = await request.post('/api/editorial/import', { headers, data: input })
    expect((await simulate.json()).dryRun).toBe(true)
    const draft = await request.post('/api/editorial/import', {
      headers,
      data: { ...input, apply: true },
    })
    expect(draft.ok()).toBeTruthy()
    const doc = await draft.json()
    id = doc.id
    expect((await request.get(`/posts/${slug}`)).status()).toBe(404)
    expect((await request.get(`/api/community/${id}`)).status()).toBe(404)
    const publish = await request.post('/api/editorial/import', {
      headers,
      data: { ...input, expectedUpdatedAt: doc.updatedAt, apply: true, publish: true },
    })
    expect(publish.ok()).toBeTruthy()
    await page.goto('/')
    await expect(page.getByRole('link', { name: new RegExp(`Revisão ${slug}`) })).toBeVisible()
    await page.goto(`/posts?q=${slug}`)
    await page.getByRole('link', { name: new RegExp(`Revisão ${slug}`) }).click()
    await expect(page.getByRole('heading', { name: `Revisão ${slug}`, exact: true })).toBeVisible()
    await expect(
      page.locator('.reader-nav').getByRole('link', { name: 'Comece aqui', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: '2. Deploy' }).click()
    await expect(page.getByText('Entrega validada.')).toBeVisible()
    await page.getByLabel('Buscar neste artigo').fill('pipeline')
    await expect(page.locator('.reader-result').first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const comment = await request.post('/api/comments', {
      headers,
      data: {
        post: id,
        name: 'Leitor de teste',
        text: `Comentário ${slug}`,
        visitorHash: 'local-test',
      },
    })
    const c = await comment.json()
    expect(comment.ok()).toBeTruthy()
    expect((await (await request.get(`/api/community/${id}`)).json()).comments).toHaveLength(0)
    expect(
      (
        await request.patch(`/api/comments/${c.doc.id}`, { headers, data: { status: 'approved' } })
      ).ok(),
    ).toBeTruthy()
    await page.reload()
    await expect(page.getByText(`Comentário ${slug}`, { exact: true })).toBeVisible()
  } finally {
    if (id) expect((await request.delete(`/api/posts/${id}`, { headers })).ok()).toBeTruthy()
  }
})
