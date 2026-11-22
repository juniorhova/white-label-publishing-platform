import { redirect } from 'next/navigation'
export default async function LegacyPostsPage({
  params,
}: {
  params: Promise<{ pageNumber: string }>
}) {
  const { pageNumber } = await params
  redirect(`/posts?page=${encodeURIComponent(pageNumber)}`)
}
