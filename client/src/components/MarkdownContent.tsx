import React from "react";
import { Link } from "wouter";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Parses basic markdown (Headers, bold, lists, and [anchor text](/url) internal/external links)
 * into rich React JSX elements with wouter <Link> for internal SEO routing.
 */
export default function MarkdownContent({ content, className = "prose prose-lg max-w-none text-gray-700 leading-relaxed" }: MarkdownContentProps) {
  if (!content) return null;

  // If content contains raw HTML tags (e.g. <h2>, <p>), render via dangerouslySetInnerHTML
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise, parse markdown paragraphs, headings, lists, and markdown links [text](url)
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className={className}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={bIdx} className="text-3xl md:text-4xl font-black text-gray-900 mt-8 mb-4">
              {parseInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={bIdx} className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-100 pb-2">
              {parseInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={bIdx} className="text-xl font-bold text-gray-800 mt-6 mb-3">
              {parseInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={bIdx} className="my-8 border-gray-200" />;
        }

        // Unordered List
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\n(?=[-*]\s+)/);
          return (
            <ul key={bIdx} className="list-disc list-inside space-y-2 my-4 pl-2 text-gray-700">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="leading-relaxed">
                  {parseInlineMarkdown(item.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Ordered List
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split(/\n(?=\d+\.\s+)/);
          return (
            <ol key={bIdx} className="list-decimal list-inside space-y-2 my-4 pl-2 text-gray-700">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="leading-relaxed">
                  {parseInlineMarkdown(item.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={bIdx} className="mb-4 text-gray-700 leading-relaxed">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses inline Markdown formatting: **bold**, *italic*, and [anchor](/url) links
 */
function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Regex to match [text](url), **bold**, and *italic*
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [anchor](/path) or [anchor](https://...)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, anchorText, url] = linkMatch;
      const isInternal = url.startsWith("/") || url.includes("akcni-letenky.com");
      const href = url.replace("https://www.akcni-letenky.com", "").replace("https://akcni-letenky.com", "");

      if (isInternal) {
        return (
          <Link key={index} href={href} className="text-[#1565C0] font-semibold underline hover:text-[#0d47a1] transition-colors">
            {anchorText}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E91E63] font-semibold underline hover:text-[#c2185b] transition-colors"
        >
          {anchorText}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}
