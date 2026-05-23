import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/**
 * Renders user-authored long-form markdown for diary entries.
 *
 * Deliberately NOT MDXRemote: diary bodies are hand-pasted prose, and MDX
 * would treat a stray `<` or `{` as JSX and break the `output: 'export'`
 * build. react-markdown treats the input as plain markdown — paste-safe,
 * and raw HTML is ignored by default (no rehype-raw).
 */
const components: Components = {
  a({ href, children, ...props }) {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
        {external && <span aria-hidden> ↗</span>}
      </a>
    );
  },
};

export function DiaryMarkdown({ source }: { source: string }) {
  return (
    <div className="prose-yolklab">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
