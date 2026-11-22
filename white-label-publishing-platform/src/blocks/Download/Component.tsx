import React from 'react'
import type { DownloadBlock } from '@/payload-types'
export function Download({ title, description, file }: DownloadBlock) {
  if (!file || typeof file !== 'object' || file.mimeType !== 'application/pdf' || !file.filename)
    return null
  const href = `/api/media/file/${encodeURIComponent(file.filename)}`
  return (
    <aside className="editorial-panel">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <a href={`${href}?download=true`} download={file.filename}>
        Baixar PDF · {file.filename}
      </a>
      {file.filesize ? <small> {Math.ceil(file.filesize / 1024)} KB</small> : null}
    </aside>
  )
}
