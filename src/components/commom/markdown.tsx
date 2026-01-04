import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export const Markdown = ({ children }: { children: string }) => {
  const components: Components = {
    // Headings and text spacing
    h1: ({ node, ...props }) => (
      <h1 className="  leading-tight font-semibold" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className=" leading-tight font-semibold" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className=" leading-tight font-semibold" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className=" leading-relaxed wrap-break-word" {...props} />
    ),
    ul: ({ node, ...props }) => <ul className=" ml-5 list-disc " {...props} />,
    ol: ({ node, ...props }) => (
      <ol className=" ml-5 list-decimal " {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="my-1  wrap-break-word" {...props} />
    ),
    hr: ({ node, ...props }) => (
      <hr
        className="my-6 border-neutral-200 dark:border-neutral-800"
        {...props}
      />
    ),
    a: ({ node, ...props }) => (
      <a {...props} className="text-chart-2 underline" />
    ),

    table: ({ node, ...props }) => (
      <div className="not-prose  w-full overflow-x-auto">
        <table
          className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:ring-neutral-800/60"
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-neutral-50 dark:bg-neutral-800" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className="max-w-[33%] overflow-hidden border-b border-neutral-200 px-2 py-1 text-left  font-medium wrap-break-word whitespace-normal text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
        {...props}
      />
    ),
    tbody: ({ node, ...props }) => (
      <tbody
        className="divide-y divide-neutral-200 dark:divide-neutral-800"
        {...props}
      />
    ),
    tr: ({ node, ...props }) => (
      <tr
        className="even:bg-neutral-50/30 hover:bg-neutral-50/70 dark:even:bg-neutral-800/20 dark:hover:bg-neutral-800/40"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className="max-w-[33%] overflow-hidden border-b-0 px-2 py-1 align-top wrap-break-word whitespace-normal"
        {...props}
      />
    ),
    code: ({ node, className, ...props }) => (
      <code
        className={
          className
            ? "rounded bg-accent-foreground p-1 px-2 text-neutral-100"
            : "block overflow-auto rounded-md bg-accent-foreground py-1 px-2 text-neutral-100"
        }
        {...props}
      />
    ),
    pre: ({ node, ...props }) => (
      <pre
        className=" w-full overflow-auto rounded-md bg-accent-foreground p-3 wrap-break-word whitespace-pre-wrap text-neutral-100"
        {...props}
      />
    ),
  };
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};
