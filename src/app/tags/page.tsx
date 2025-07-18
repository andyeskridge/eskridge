import { Badge } from '@/components/badge';
import { SimpleLayout } from '@/components/simple-layout';
import { getAllTags } from '@/lib/get-all-tags';

export const metadata = {
  title: 'Tags',
  description: 'Browse articles by tags to find specific topics.',
};

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <SimpleLayout
      intro="Explore articles organized by specific topics and technologies."
      title="Browse by tags"
    >
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <div className="group" key={tag._sys.filename}>
            <Badge
              className="px-4 py-2 text-base transition-transform group-hover:scale-105"
              color={tag.color ?? undefined}
              href={`/tags/${tag.slug}`}
              variant="tag"
            >
              {tag.name}
            </Badge>
          </div>
        ))}
      </div>
    </SimpleLayout>
  );
}
