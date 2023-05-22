import { ReactMarkdown } from "react-markdown/lib/react-markdown"

type MarkdownPreview = {
  markdown: string
}

export const MarkdownPreview = ({ markdown }: MarkdownPreview) => {
  return (
    <ReactMarkdown
      className="prose prose-zinc mt-12 border-zinc-200 dark:prose-invert dark:border-zinc-600"
    >
      {markdown}
    </ReactMarkdown>
  )
}
