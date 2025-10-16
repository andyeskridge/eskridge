import client from "@/tina/__generated__/client";

import PageClient from "./page-client";

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  const { filename } = await params;

  const res = await client.queries.post({
    relativePath: `${filename}.md`,
  });

  return <PageClient {...res} />;
}

export async function generateStaticParams() {
  const posts = await client.queries.postConnection();
  const paths =
    posts.data?.postConnection?.edges
      ?.map((edge) => edge?.node?._sys.breadcrumbs.join("/"))
      .filter((filename): filename is string => Boolean(filename))
      .map((filename) => ({ filename })) ?? [];

  return paths;
}
