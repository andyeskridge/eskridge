import { ForwardRefExoticComponent, RefAttributes, forwardRef } from 'react'

import clsx from 'clsx'

const OuterContainer = forwardRef(function OuterContainer(
  {
    className,
    children,
    ...props
  }: { className?: string; children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div ref={ref} className={clsx('sm:px-8', className)} {...props}>
      <div className="mx-auto max-w-7xl lg:px-8">{children}</div>
    </div>
  )
})

const InnerContainer = forwardRef(function InnerContainer(
  {
    className,
    children,
    ...props
  }: { className?: string; children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={clsx('relative px-4 sm:px-8 lg:px-12', className)}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  )
})

const _Container: ForwardRefExoticComponent<
  {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
  } & RefAttributes<HTMLDivElement>
> & {
  Outer?: ForwardRefExoticComponent<
    {
      className?: string
      children: React.ReactNode
    } & RefAttributes<HTMLDivElement>
  >
  Inner?: ForwardRefExoticComponent<
    {
      className?: string
      children: React.ReactNode
    } & RefAttributes<HTMLDivElement>
  >
} = forwardRef(function Container(
  { children, ...props }: { children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <OuterContainer ref={ref} {...props}>
      <InnerContainer>{children}</InnerContainer>
    </OuterContainer>
  )
})

_Container.Outer = OuterContainer
_Container.Inner = InnerContainer

export const Container = _Container as ForwardRefExoticComponent<
  {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
  } & RefAttributes<HTMLDivElement>
> & {
  Outer: ForwardRefExoticComponent<
    {
      className?: string
      children: React.ReactNode
    } & RefAttributes<HTMLDivElement>
  >
  Inner: ForwardRefExoticComponent<
    {
      className?: string
      children: React.ReactNode
    } & RefAttributes<HTMLDivElement>
  >
}
