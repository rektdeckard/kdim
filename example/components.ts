import van from "./vendor/van-1.2.3.min";
import type { ChildDom, Props } from "./vendor/van-1.2.3.min";

const { div, details, summary, section, h2, p, button, label, input } =
  van.tags;

export type SideByProps = { left?: ChildDom; right?: ChildDom };

export function SideBy({ left, right }: SideByProps, ...children: ChildDom[]) {
  return div(
    { class: "sideby" },
    left ? div({ class: "flex left" }, left) : null,
    children.length ? div(...children) : null,
    right ? div({ class: "flex right" }, right) : null
  );
}

export function Example(...children: ChildDom[]) {
  return div({ class: "example" }, ...children);
}

export function Section(s: string, ...children: ChildDom[]) {
  return section({}, h2(s), div({ class: "col" }, ...children));
}

export function Detail(s: string, open: boolean, ...children: ChildDom[]) {
  return details({ open }, summary(s), div({ class: "col" }, ...children));
}
