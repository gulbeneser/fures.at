import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(markdown: string) {
  return marked.parse(markdown);
}
