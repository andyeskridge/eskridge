---
author: Andy Eskridge,
date: 2022-10-06,
title: Typescript issues,
description: An issue I ran into with Typescript and how I solved it,
---

## Context

I'm using the wonderful Tailwind template [Spotlight](https://tailwindui.com/templates/spotlight), but it was written in plain Javascript. I have been enjoying Typescript and I wanted to use it with this template. The process of converting the Javascript to Typescript was pretty straightforward, but I ran into an issue with the `Container` component.

## The issue

The original Container definition is below:

```tsx
export const Container = forwardRef(function Container(
  { children, ...props },
  ref
) {
  return (
    <OuterContainer ref={ref} {...props}>
      <InnerContainer>{children}</InnerContainer>
    </OuterContainer>
  )
})

Container.Outer = OuterContainer
Container.Inner = InnerContainer
```

The big headache I had was the `Outer` and `Inner` components being tacked onto the `Container` component. I was trying so hard to come up with a succinct type that I could place directly on the `Container` to define the `Outer` and `Inner` components. But the issue was that the `Outer` and `Inner` components didn't exist on the `Container` component until after the `Container` component was defined.

## The solution

The solution was straightforward in the end. I just needed to have a

```tsx
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
```
