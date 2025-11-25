'use client';

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "subtle";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

export function Button({
  children,
  className = "",
  variant = "primary",
  iconLeft,
  iconRight,
  ...rest
}: ButtonProps) {
  const classes = ["ui-button", `ui-button--${variant}`, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...rest}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}
