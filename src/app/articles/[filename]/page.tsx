import client from "@/tina/__generated__/client";

import PageClient from "./page-client";

export const dynamicParams = false;

export default async function Page(props: {
  params: Promise<{ filename: string }>;
}) {
  const params = await props.params;

  const { filename } = params;

  const res = await client.queries.post({
    relativePath: `${filename}.md`,
  });

  return <PageClient {...res} />;
}

export async function generateStaticParams() {
  const posts = await client.queries.postConnection();
  const paths = posts.data?.postConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys.breadcrumbs.join("/"),
  }));

  return paths || [];
}
