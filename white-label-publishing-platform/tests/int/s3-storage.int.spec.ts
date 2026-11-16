import { describe, expect, it } from 'vitest'
import { s3Storage } from '@payloadcms/storage-s3'
import { getS3StorageOptions } from '@/storage/s3'
import { Media } from '@/collections/Media'
import { postgresAdapter } from '@payloadcms/db-postgres'

const configured = {
  S3_ENABLED: 'true',
  S3_BUCKET: 'example-private-materials',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY_ID: 'test-key',
  S3_SECRET_ACCESS_KEY: 'test-secret',
}

describe('Private S3 Media storage', () => {
  it('keeps unconfigured development environments available', () => {
    expect(getS3StorageOptions({}).enabled).toBe(false)
  })

  it('fails closed for incomplete or accidentally disabled configuration', () => {
    expect(() => getS3StorageOptions({ S3_ENABLED: 'true' })).toThrow('Missing S3 configuration')
    expect(() => getS3StorageOptions({ ...configured, S3_ENABLED: 'false' })).toThrow(
      'Set S3_ENABLED=true',
    )
    expect(() => getS3StorageOptions({ S3_ENABLED: 'yes' })).toThrow('must be true or false')
  })

  it('never includes credential values in validation errors', () => {
    expect(() => getS3StorageOptions({ ...configured, S3_REGION: '' })).toThrow(
      'Missing S3 configuration: S3_REGION',
    )
  })

  it('uses the native authenticated upload and public same-domain file handler', async () => {
    const options = getS3StorageOptions(configured)
    expect(options.clientUploads).toBe(false)
    expect(options.signedDownloads).toBe(false)
    expect(options.collections.media).toBe(true)
    const result = await s3Storage(options)({
      collections: [Media],
      db: postgresAdapter({ pool: { connectionString: '' } }),
      secret: 'local-test-only',
    })
    const media = result.collections!.find((collection) => collection.slug === 'media')!
    expect(media.upload).toMatchObject({ disableLocalStorage: true })
    expect(media.access!.create!({ req: { user: null } } as never)).toBe(false)
    expect(media.access!.read!({ req: { user: null } } as never)).toBe(true)
    expect(media.fields.some((field) => 'name' in field && field.name === 'prefix')).toBe(false)
    expect(result.endpoints?.some((endpoint) => endpoint.path.includes('signed-url'))).toBeFalsy()
  })
})
