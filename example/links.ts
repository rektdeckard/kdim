import van, { ChildDom } from "./vendor/van-1.2.3.min";

const REPO_URL = "https://github.com/rektdeckard/kdim";

function documentationURL(topic: string) {
  return `${REPO_URL}#${topic}`;
}

export function DocumentationLink(topic: string, ...children: readonly ChildDom[]) {
  return van.tags.a({ href: documentationURL(topic) }, ...children);
}

export const docs = {
  complex: (...children: readonly ChildDom[]) => DocumentationLink("complex", ...children),
  noise: (...children: readonly ChildDom[]) => DocumentationLink("noise", ...children),
  rational: (...children: readonly ChildDom[]) => DocumentationLink("rational", ...children),
} as const; 
