import { Fragment, type ReactNode } from "react";

/**
 * Como format(), pero permite insertar nodos de React (p. ej. <code>)
 * dentro de un mensaje traducido: rich("Usa {x} aquí", { x: <code>x</code> }).
 */
export function rich(
  message: string,
  values: Record<string, ReactNode>,
): ReactNode {
  const parts = message.split(/(\{\w+\})/g);
  return parts.map((part, index) => {
    const match = /^\{(\w+)\}$/.exec(part);
    const node = match && match[1] in values ? values[match[1]] : part;
    return <Fragment key={index}>{node}</Fragment>;
  });
}
