import { Card } from '@/components/card';
import { SimpleLayout } from '@/components/simple-layout';
import { formatDate } from '@/lib/format-date';
import { getAllArticles } from '@/lib/get-all-articles';
import { getAllTags } from '@/lib/get-all-tags';
import type { Post } from '@/tina/__generated__/types';
import { notFound } from 'next/navigation';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function Article({ article }: { article: Post }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/articles/${article._sys.filename}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
        >
          {formatDate(article.date)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Meta category={article.category} tags={article.tags} />
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={article.date}
        className="mt-1 hidden md:block"
      >
        {formatDate(article.date)}
      </Card.Eyebrow>
    </article>
  );
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tags = await getAllTags();
  const tag = tags.find((t) => t.slug === slug);

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `${tag.name} Articles`,
    description: tag.description || `Articles tagged with ${tag.name}.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [articles, tags] = await Promise.all([getAllArticles(), getAllTags()]);

  const tag = tags.find((t) => t.slug === slug);

  if (!tag) {
    notFound();
  }

  const taggedArticles = articles.filter((article) =>
    article.tags?.some((tagObj) => tagObj?.tag?.slug === slug)
  );

  return (
    <SimpleLayout
      title={`${tag.name} Articles`}
      intro={
        tag.description ||
        `All articles tagged with ${tag.name}, sorted by date.`
      }
    >
      <div className="md:border-zinc-100 md:border-l md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {taggedArticles.length > 0 ? (
            taggedArticles.map((article) => (
              <Article key={article._sys.filename} article={article} />
            ))
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              No articles found with this tag yet.
            </p>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
}
