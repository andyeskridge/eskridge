import { Badge } from '@/components/badge';
import { SimpleLayout } from '@/components/simple-layout';
import { getAllCategories } from '@/lib/get-all-categories';

export const metadata = {
  title: 'Categories',
  description:
    'Browse articles by category to find content that interests you.',
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <SimpleLayout
      title="Browse by category"
      intro="Explore articles organized by topic to find content that interests you."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category._sys.filename}
            className="group relative rounded-2xl border border-zinc-100 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-700/40 dark:hover:border-zinc-600"
          >
            <Badge
              variant="category"
              color={category.color ?? undefined}
              href={`/categories/${category.slug}`}
              className="px-4 py-2 text-base"
            >
              {category.name}
            </Badge>
            {category.description && (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {category.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </SimpleLayout>
  );
}
