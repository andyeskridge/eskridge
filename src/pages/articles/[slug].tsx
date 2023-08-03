import { SVGProps } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { Article as ArticleType, allArticles } from 'contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer/hooks'

import { formatDate } from '@/lib/formatDate'

import { Container } from '@/components/Container'
import { ArrowLeftIcon } from '@/components/Icons'
import { Prose } from '@/components/Prose'

export async function getStaticPaths() {
  const paths = allArticles.map((post) => post.url)
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = allArticles.find(
    (post) => post._raw.flattenedPath === params.slug,
  )
  return {
    props: {
      post,
    },
  }
}

const Article = ({
  post,
  previousPathname,
}: {
  post: ArticleType
  previousPathname: string
}) => {
  const router = useRouter()
  const Component = useMDXComponent(post.body.code)
  return (
    <>
      <Head>
        <title>{`${post.title} - Andy Eskridge`}</title>
        <meta name="description" content={post.description} />
      </Head>
      <Container className="mt-16 lg:mt-32">
        <div className="xl:relative">
          <div className="mx-auto max-w-2xl">
            {previousPathname && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back to articles"
                className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:mb-0 lg:-mt-2 xl:-top-1.5 xl:left-0 xl:mt-0"
              >
                <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
              </button>
            )}
            <article>
              <header className="flex flex-col">
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                  {post.title}
                </h1>
                <time
                  dateTime={post.date}
                  className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500"
                >
                  <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                  <span className="ml-3">{formatDate(post.date)}</span>
                </time>
              </header>
              <Prose className="mt-8">
                <Component />
              </Prose>
            </article>
          </div>
        </div>
      </Container>
    </>
  )
}

export default Article
