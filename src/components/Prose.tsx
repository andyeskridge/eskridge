import clsx from 'clsx'
import React from 'react'

export function Prose({
  className,
  ...props
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={clsx(className, 'prose dark:prose-invert')} {...props} />
  )
}
