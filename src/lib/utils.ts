import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert markdown-ish output to clean plain text with minimal formatting.
// - Strips *, **, _, `, #, > and code fences
// - Converts markdown lists (-, *, +) at line start to simple dashes
// - Preserves numbered lists (1., 2., ...)
// - Converts [label](url) and ![alt](url) to "label (url)" / "alt (url)"
// - Normalizes excessive blank lines
export function cleanPlainText(input: string): string {
  let text = input ?? "";

  // Unfence code blocks, keep inner content
  text = text.replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, "$1");

  // Inline code -> plain
  text = text.replace(/`([^`]*)`/g, "$1");

  // Links and images
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // Headers and blockquotes
  text = text.replace(/^\s*#{1,6}\s*/gm, "");
  text = text.replace(/^\s*>\s?/gm, "");

  // Bold/italic markers
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");

  // Horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");

  // Bullet lists to simple dash
  text = text.replace(/^\s*[-*+]\s+/gm, "- ");

  // Remove any stray asterisks left
  text = text.replace(/\*/g, "");

  // Trim trailing spaces on each line
  text = text.replace(/[\t ]+$/gm, "");

  // Collapse excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
