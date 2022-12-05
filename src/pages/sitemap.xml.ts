import { NextApiResponse } from 'next'
import { generateSitemap } from '@/lib/generateSitemap'

const Sitemap = () => {
  return null
}

export const getServerSideProps = async ({ res }: { res: NextApiResponse }) => {
  const sitemap = await generateSitemap()

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default Sitemap
