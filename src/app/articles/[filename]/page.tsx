import client from '@/tina/__generated__/client'

import PageClient from './PageClient'

export const runtime = 'edge'
export const dynamicParams = false

export default async function Page({
  params: { filename },
}: {
  params: { filename: string }
}) {
  const res = await client.queries.post({
    relativePath: `${filename}.md`,
  })

  return <PageClient {...res} />
}

export async function generateStaticParams() {
  const postsListData = await client.queries.postConnection()

  return (postsListData.data.postConnection.edges || []).map((post) => ({
    filename: post?.node?._sys.filename,
  }))
}
