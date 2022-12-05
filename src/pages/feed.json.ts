import { NextApiResponse } from 'next'
import { generateRssFeed } from '@/lib/generateRssFeed'

const RSSFeed = () => {
  return null
}

export const getServerSideProps = async ({ res }: { res: NextApiResponse }) => {
  const jsonFeed = (await generateRssFeed()).json1()

  res.setHeader('Content-Type', 'application/json')
  res.write(jsonFeed)
  res.end()

  return {
    props: {},
  }
}

export default RSSFeed
