import { notFound } from "next/navigation";
import { Card } from "@/components/card";
import { SimpleLayout } from "@/components/simple-layout";
import { formatDate } from "@/lib/format-date";
import { getAllArticles } from "@/lib/get-all-articles";
import { getAllCategories } from "@/lib/get-all-categories";
import type { Post } from "@/tina/__generated__/types";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function Article({ article }: { article: Post }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/articles/${article._sys.filename}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          className="md:hidden"
          dateTime={article.date}
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
        className="mt-1 hidden md:block"
        dateTime={article.date}
      >
        {formatDate(article.date)}
      </Card.Eyebrow>
    </article>
  );
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} Articles`,
    description:
      category.description || `Articles in the ${category.name} category.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [articles, categories] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
  ]);

  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryArticles = articles.filter(
    (article) => article.category?.slug === slug,
  );

  return (
    <SimpleLayout
      intro={
        category.description ||
        `All articles in the ${category.name} category, sorted by date.`
      }
      title={`${category.name} Articles`}
    >
      <div className="md:border-zinc-100 md:border-l md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {categoryArticles.length > 0 ? (
            categoryArticles.map((article) => (
              <Article article={article} key={article._sys.filename} />
            ))
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              No articles found in this category yet.
            </p>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
}
