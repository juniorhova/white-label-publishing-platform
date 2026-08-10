import { describe, expect, it } from 'vitest'

import { GET } from '@/app/(frontend)/api/health/route'

describe('health endpoint', () => {
  it('returns a healthy response', async () => {
    const response = GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      ok: true,
      service: 'white-label-publishing-platform',
    })
  })
})
