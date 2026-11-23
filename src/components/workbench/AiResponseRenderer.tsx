import { Fragment, ReactNode, useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Loader2, Sparkles } from "lucide-react";

interface AiResponseRendererProps {
  title?: string;
  responseText: string;
  provider?: string;
  model?: string;
  sourceMode?: "live_gemini" | "manual";
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  compact?: boolean;
  maxHeightClass?: string;
}

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "hr" }
  | { type: "list"; ordered: boolean; items: string[] }
  | {
      type: "table";
      headers: string[];
      alignments: ("left" | "center" | "right")[];
      rows: string[][];
    };

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|") && !trimmed.includes("-")) return false;
  const cells = splitTableRow(trimmed);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);

  const cells: string[] = [];
  let current = "";
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "\\" && i + 1 < trimmed.length && trimmed[i + 1] === "|") {
      current += "|";
      i++;
    } else if (ch === "|") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseTableAlignments(line: string): ("left" | "center" | "right")[] {
  return splitTableRow(line).map((cell) => {
    const t = cell.trim();
    if (t.startsWith(":") && t.endsWith(":")) return "center";
    if (t.endsWith(":")) return "right";
    return "left";
  });
}

function isHeadingLine(line: string): boolean {
  return /^\s{0,3}#{1,6}\s+/.test(line);
}

function isHrLine(line: string): boolean {
  return /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line);
}

function isBlockquoteLine(line: string): boolean {
  return /^\s{0,3}>\s?/.test(line);
}

function isUnorderedListLine(line: string): boolean {
  return /^\s*[-*+]\s+/.test(line);
}

function isOrderedListLine(line: string): boolean {
  return /^\s*\d+[.)]\s+/.test(line);
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block (```)
    const fenceMatch = line.match(/^\s*```([a-zA-Z0-9_+-]*)\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1] ?? "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && /^\s*```\s*$/.test(lines[i])) {
        i++;
      }
      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // Horizontal rule
    if (isHrLine(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Heading (# .. ######)
    const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      const rawLevel = headingMatch[1].length;
      const level = (rawLevel <= 1
        ? 1
        : rawLevel === 2
        ? 2
        : rawLevel === 3
        ? 3
        : 4) as 1 | 2 | 3 | 4;
      blocks.push({
        type: "heading",
        level,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // GFM Table
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparatorLine(lines[i + 1])
    ) {
      const headers = splitTableRow(line);
      const alignments = parseTableAlignments(lines[i + 1]);
      i += 2;
      const rows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        lines[i].includes("|") &&
        !isHeadingLine(lines[i]) &&
        !/^\s*```/.test(lines[i])
      ) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({
        type: "table",
        headers,
        alignments,
        rows,
      });
      continue;
    }

    // Blockquote
    if (isBlockquoteLine(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && isBlockquoteLine(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s{0,3}>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    // Unordered list
    if (isUnorderedListLine(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (isUnorderedListLine(cur)) {
          items.push(cur.replace(/^\s*[-*+]\s+/, "").trim());
          i++;
        } else if (
          cur.trim() !== "" &&
          /^\s{2,}/.test(cur) &&
          !isOrderedListLine(cur) &&
          !isHeadingLine(cur) &&
          items.length > 0
        ) {
          items[items.length - 1] += " " + cur.trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Ordered list
    if (isOrderedListLine(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (isOrderedListLine(cur)) {
          items.push(cur.replace(/^\s*\d+[.)]\s+/, "").trim());
          i++;
        } else if (
          cur.trim() !== "" &&
          /^\s{2,}/.test(cur) &&
          !isUnorderedListLine(cur) &&
          !isHeadingLine(cur) &&
          items.length > 0
        ) {
          items[items.length - 1] += " " + cur.trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // Paragraph (stop at next block delimiter)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (!cur.trim()) break;
      if (
        /^\s*```/.test(cur) ||
        isHeadingLine(cur) ||
        isHrLine(cur) ||
        isBlockquoteLine(cur) ||
        isUnorderedListLine(cur) ||
        isOrderedListLine(cur) ||
        (cur.includes("|") &&
          i + 1 < lines.length &&
          isTableSeparatorLine(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(cur.trim());
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    } else {
      i++;
    }
  }

  return blocks;
}

function isSafeHref(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

export function renderInlineMarkdown(
  text: string,
  keyPrefix = "inl"
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenRegex =
    /(`[^`\n]+`|\*\*\*[^*\n]+?\*\*\*|___[^_\n]+?___|\*\*[^*\n]+?\*\*|__[^_\n]+?__|~~[^~\n]+?~~|\[([^\]\n]+)\]\(([^)\s]+)\)|\*[^*\s](?:[^*\n]*?[^*\s])?\*|(?<![a-zA-Z0-9])_[^_\s](?:[^_\n]*?[^_\s])?_(?![a-zA-Z0-9]))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${tokenIdx++}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[#8B1E24] dark:text-[#FCA5A5] font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith("***") && token.endsWith("***")) ||
      (token.startsWith("___") && token.endsWith("___"))
    ) {
      nodes.push(
        <strong key={key} className="font-semibold italic text-[#0F172A] dark:text-[#F8FAFC]">
          {renderInlineMarkdown(token.slice(3, -3), key)}
        </strong>
      );
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      nodes.push(
        <strong key={key} className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
          {renderInlineMarkdown(token.slice(2, -2), key)}
        </strong>
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(
        <del key={key} className="line-through text-slate-500 dark:text-slate-400">
          {renderInlineMarkdown(token.slice(2, -2), key)}
        </del>
      );
    } else if (token.startsWith("[") && match[2] && match[3]) {
      const label = match[2];
      const href = match[3];
      if (isSafeHref(href)) {
        nodes.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#1E3A5F] dark:text-[#60A5FA] underline underline-offset-2 hover:text-[#8B1E24] dark:hover:text-[#F87171]"
          >
            {renderInlineMarkdown(label, key)}
          </a>
        );
      } else {
        nodes.push(renderInlineMarkdown(label, key));
      }
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(
        <em key={key} className="italic">
          {renderInlineMarkdown(token.slice(1, -1), key)}
        </em>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function alignClass(alignment: "left" | "center" | "right"): string {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
}

export function AiResponseRenderer({
  title = "Respuesta generada por la IA",
  responseText,
  provider,
  model,
  sourceMode,
  isLoading = false,
  errorMessage = null,
  emptyMessage = "Aún no hay una respuesta generada. Ejecuta la instrucción en la modalidad directa o registra el resultado de una prueba externa.",
  compact = false,
  maxHeightClass,
}: AiResponseRendererProps) {
  const [copied, setCopied] = useState(false);

  const blocks = useMemo(
    () => parseMarkdownBlocks(responseText),
    [responseText]
  );

  const hasText = responseText.trim().length > 0;

  const handleCopy = async () => {
    if (!hasText) return;
    try {
      await navigator.clipboard.writeText(responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const metadataLabel = [
    provider?.trim(),
    model?.trim(),
    !provider?.trim() && sourceMode
      ? sourceMode === "live_gemini"
        ? "Prueba directa"
        : "Prueba externa"
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
      {/* Cabecera del visor */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] ${
          compact ? "px-3.5 py-2.5" : "px-4 py-3"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Sparkles
            className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0"
            aria-hidden="true"
          />
          <h3
            className={`font-bold text-[#1E3A5F] dark:text-[#F1F5F9] ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {title}
          </h3>
          {metadataLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1E3A5F]/10 dark:bg-[#60A5FA]/15 text-[#1E3A5F] dark:text-[#93C5FD] border border-[#1E3A5F]/20 dark:border-[#60A5FA]/30">
              {metadataLabel}
            </span>
          )}
        </div>

        {hasText && !isLoading && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F] dark:text-[#CBD5E1] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-200/70 dark:hover:bg-[#334155] border border-[#CBD5E1] dark:border-[#334155] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check
                  className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Copiada
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copiar respuesta</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Cuerpo del visor */}
      <div
        className={`${compact ? "p-3.5" : "p-4 sm:p-5"} ${
          maxHeightClass ? `${maxHeightClass} overflow-y-auto` : ""
        }`}
      >
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 py-6 justify-center text-sm text-[#1E3A5F] dark:text-[#CBD5E1]"
          >
            <Loader2
              className="w-5 h-5 animate-spin text-[#8B1E24] dark:text-[#F87171]"
              aria-hidden="true"
            />
            <span className="font-medium">
              Ejecutando instrucción y generando respuesta de la IA...
            </span>
          </div>
        ) : errorMessage && !hasText ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 text-xs leading-relaxed"
          >
            <AlertTriangle
              className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{errorMessage}</span>
          </div>
        ) : !hasText ? (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`space-y-3 text-[#1E293B] dark:text-[#E2E8F0] leading-relaxed ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {blocks.map((block, idx) => {
              if (block.type === "heading") {
                const headingClasses =
                  block.level === 1
                    ? compact
                      ? "text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9] pt-1"
                      : "text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9] pt-1 border-b border-[#E2E8F0] dark:border-[#334155] pb-1"
                    : block.level === 2
                    ? compact
                      ? "text-xs sm:text-sm font-bold text-[#1E3A5F] dark:text-[#93C5FD] pt-1"
                      : "text-sm sm:text-base font-bold text-[#1E3A5F] dark:text-[#93C5FD] pt-1"
                    : "text-xs sm:text-sm font-semibold text-[#8B1E24] dark:text-[#FCA5A5] pt-0.5";

                if (block.level === 1) {
                  return (
                    <h4 key={idx} className={headingClasses}>
                      {renderInlineMarkdown(block.text, `h1-${idx}`)}
                    </h4>
                  );
                }
                if (block.level === 2) {
                  return (
                    <h5 key={idx} className={headingClasses}>
                      {renderInlineMarkdown(block.text, `h2-${idx}`)}
                    </h5>
                  );
                }
                return (
                  <h6 key={idx} className={headingClasses}>
                    {renderInlineMarkdown(block.text, `h-${idx}`)}
                  </h6>
                );
              }

              if (block.type === "hr") {
                return (
                  <hr
                    key={idx}
                    className="border-[#CBD5E1] dark:border-[#334155] my-2"
                  />
                );
              }

              if (block.type === "blockquote") {
                return (
                  <blockquote
                    key={idx}
                    className="border-l-4 border-[#8B1E24] dark:border-[#F87171] pl-3.5 py-1 bg-white/70 dark:bg-[#1E293B]/60 rounded-r-md text-slate-700 dark:text-[#CBD5E1] space-y-1"
                  >
                    {block.lines.map((line, lineIdx) => (
                      <p key={lineIdx}>
                        {renderInlineMarkdown(line, `bq-${idx}-${lineIdx}`)}
                      </p>
                    ))}
                  </blockquote>
                );
              }

              if (block.type === "code") {
                return (
                  <div
                    key={idx}
                    className="rounded-lg overflow-hidden border border-[#CBD5E1] dark:border-[#334155] bg-[#0F172A] text-slate-100"
                  >
                    {block.language && (
                      <div className="px-3 py-1 bg-[#1E293B] border-b border-slate-700 text-[11px] font-mono text-slate-300">
                        {block.language}
                      </div>
                    )}
                    <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                );
              }

              if (block.type === "list") {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag
                    key={idx}
                    className={`pl-5 space-y-1.5 ${
                      block.ordered ? "list-decimal" : "list-disc"
                    } marker:text-[#8B1E24] dark:marker:text-[#F87171] marker:font-semibold`}
                  >
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="pl-1">
                        {renderInlineMarkdown(item, `li-${idx}-${itemIdx}`)}
                      </li>
                    ))}
                  </ListTag>
                );
              }

              if (block.type === "table") {
                return (
                  <div
                    key={idx}
                    className="overflow-x-auto rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  >
                    <table className="min-w-full border-collapse text-xs">
                      <thead className="bg-[#1E3A5F] dark:bg-[#2B4F7E] text-white">
                        <tr>
                          {block.headers.map((header, hIdx) => (
                            <th
                              key={hIdx}
                              scope="col"
                              className={`px-3 py-2 font-semibold border-b border-[#CBD5E1] dark:border-[#334155] ${alignClass(
                                block.alignments[hIdx] ?? "left"
                              )}`}
                            >
                              {renderInlineMarkdown(header, `th-${idx}-${hIdx}`)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                        {block.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              rIdx % 2 === 1
                                ? "bg-[#F8FAFC] dark:bg-[#0F172A]/60"
                                : "bg-white dark:bg-[#1E293B]"
                            }
                          >
                            {block.headers.map((_, cIdx) => (
                              <td
                                key={cIdx}
                                className={`px-3 py-2 align-top text-[#1E293B] dark:text-[#E2E8F0] ${alignClass(
                                  block.alignments[cIdx] ?? "left"
                                )}`}
                              >
                                {renderInlineMarkdown(
                                  row[cIdx] ?? "",
                                  `td-${idx}-${rIdx}-${cIdx}`
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return (
                <p key={idx}>
                  <Fragment>
                    {renderInlineMarkdown(block.text, `p-${idx}`)}
                  </Fragment>
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
