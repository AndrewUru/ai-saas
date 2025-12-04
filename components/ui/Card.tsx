import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  strong?: boolean;
};

export function Card({
  children,
  className = "",
  padded = true,
  strong = false,
  ...rest
}: CardProps) {
  const classes = [
    "ui-card",
    padded ? "ui-card--padded" : "",
    strong ? "ui-card--strong" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
