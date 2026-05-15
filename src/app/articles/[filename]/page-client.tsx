"use client";

import { useTina } from "tinacms/dist/react";

import type { PostQuery } from "@/tina/__generated__/types";

import PageServer from "./page-server";

interface ClientPageProps {
  data: PostQuery;
  query: string;
  variables: {
    relativePath: string;
  };
}

export default function PageClient({
  query,
  variables,
  data,
}: ClientPageProps) {
  const { data: tinaData } = useTina({
    query,
    variables,
    data,
  });

  return <PageServer data={tinaData} />;
}
