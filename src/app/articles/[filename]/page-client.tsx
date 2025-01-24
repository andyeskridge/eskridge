'use client';

import { useTina } from 'tinacms/dist/react';

import type { PostQuery } from '@/tina/__generated__/types';

import PageServer from './page-server';

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: PostQuery;
}

export default function PageClient({
  query,
  variables,
  data,
}: ClientPageProps) {
  const { data: tinaData } = useTina({
    query: query,
    variables: variables,
    data: data,
  });

  return (
    <>
      <PageServer data={tinaData} />
    </>
  );
}
