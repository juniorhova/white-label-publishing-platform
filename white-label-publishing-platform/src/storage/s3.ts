import { s3Storage, type S3StorageOptions } from '@payloadcms/storage-s3'

type Environment = Record<string, string | undefined>

export function getS3StorageOptions(env: Environment = process.env): S3StorageOptions {
  const flag = env.S3_ENABLED?.trim()
  if (flag && flag !== 'true' && flag !== 'false') {
    throw new Error('S3_ENABLED must be true or false.')
  }
  const enabled = flag === 'true'
  const required = ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const
  if (enabled) {
    const missing = required.filter((name) => !env[name]?.trim())
    if (missing.length) throw new Error(`Missing S3 configuration: ${missing.join(', ')}`)
  } else if (required.some((name) => env[name]?.trim())) {
    throw new Error('S3 configuration is present. Set S3_ENABLED=true or remove the S3 variables.')
  }

  return {
    enabled,
    bucket: env.S3_BUCKET?.trim() || '',
    // No prefix or additional fields: the Media database schema stays unchanged.
    // Keep Payload's default file proxy and access checks enabled.
    collections: { media: true },
    disableLocalStorage: true,
    clientUploads: false,
    signedDownloads: false,
    config: {
      region: env.S3_REGION?.trim(),
      credentials: enabled
        ? {
            accessKeyId: env.S3_ACCESS_KEY_ID!.trim(),
            secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
          }
        : undefined,
    },
  }
}

export const mediaS3Storage = () => s3Storage(getS3StorageOptions())
