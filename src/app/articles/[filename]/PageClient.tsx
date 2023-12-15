'use client'

import { useTina } from 'tinacms/dist/react'
import PageServer from './PageServer'

export default function PageClient({
  query,
  variables,
  data,
}: {
  query: any
  variables: any
  data: any
}) {
  const { data: tinaData } = useTina({
    query: query,
    variables: variables,
    data: data,
  })

  return (
    <>
      <PageServer data={tinaData} />
    </>
  )
}
