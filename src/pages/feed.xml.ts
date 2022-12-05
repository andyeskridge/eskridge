import { NextApiResponse } from 'next'
import { generateRssFeed } from '@/lib/generateRssFeed'

const RSSFeed = () => {
  return null
}

export const getServerSideProps = async ({ res }: { res: NextApiResponse }) => {
  const rssFeed = (await generateRssFeed()).rss2()

  res.setHeader('Content-Type', 'text/xml')
  res.write(rssFeed)
  res.end()

  return {
    props: {},
  }
}

export default RSSFeed
