"use client";

import { useTina } from "tinacms/dist/react";

import type { PostQuery } from "@/tina/__generated__/types";

import PageServer from "./page-server";

type ClientPageProps = {
  query: string;
  variables: {
    relativePath: string;
  };
  data: PostQuery;
};

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
