import { formatDate } from '@/lib/format-date';
import { getAllArticles } from '@/lib/get-all-articles';

import { Card } from '@/components/card';
import { SimpleLayout } from '@/components/simple-layout';

import type { Post } from '@/tina/__generated__/types';

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

export const metadata = {
  title: 'Articles',
  description:
    'All of my long-form thoughts on programming, leadership, product design, and more, collected in chronological order.',
};

export default async function ArticlesIndex() {
  const articles = await getAllArticles();

  return (
    <SimpleLayout
      title="Writing on programming, leadership, and product design."
      intro="All of my long-form thoughts on programming, leadership, product design, and more, collected in chronological order."
    >
      <div className="md:border-zinc-100 md:border-l md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {articles.map((article) => (
            <Article key={article?._sys.filename} article={article} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  );
}
