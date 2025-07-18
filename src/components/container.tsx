import clsx from 'clsx';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from 'react';

export const ContainerOuter = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<'div'>
>(function OuterContainer({ className, children, ...props }, ref) {
  return (
    <div className={clsx('sm:px-8', className)} ref={ref} {...props}>
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  );
});

export const ContainerInner = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<'div'>
>(function InnerContainer({ className, children, ...props }, ref) {
  return (
    <div
      className={clsx('relative px-4 sm:px-8 lg:px-12', className)}
      ref={ref}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  );
});

export const Container = forwardRef<
  ElementRef<typeof ContainerOuter>,
  ComponentPropsWithoutRef<typeof ContainerOuter>
>(function ContainerComponent({ children, ...props }, ref) {
  return (
    <ContainerOuter ref={ref} {...props}>
      <ContainerInner>{children}</ContainerInner>
    </ContainerOuter>
  );
});
