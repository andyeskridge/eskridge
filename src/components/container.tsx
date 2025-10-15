import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type DivProps = ComponentPropsWithoutRef<"div">;

export function ContainerOuter({ className, children, ...props }: DivProps) {
  return (
    <div className={clsx("sm:px-8", className)} {...props}>
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  );
}

export function ContainerInner({ className, children, ...props }: DivProps) {
  return (
    <div
      className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  );
}

type ContainerProps = ComponentPropsWithoutRef<typeof ContainerOuter>;

export function Container({ children, ...props }: ContainerProps) {
  return (
    <ContainerOuter {...props}>
      <ContainerInner>{children}</ContainerInner>
    </ContainerOuter>
  );
}
