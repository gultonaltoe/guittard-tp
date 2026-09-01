import type { ReactNode } from "react";
import Link from "next/link";
import ManageCookiesInlineButton from "@/components/ManageCookiesInlineButton";

// Mini-syntaxe volontairement limitée pour les pages légales éditables depuis
// l'admin (mentions légales / politique de confidentialité) : titres "## ",
// listes "- ", tableaux façon Markdown ("| ... | ... |"), **gras**,
// [texte](lien), et le jeton spécial {{gerer-cookies}} qui insère le bouton
// interactif "Gérer mes cookies". Pas de moteur Markdown générique par choix
// — seul ce sous-ensemble est nécessaire, et il reste facile à documenter
// pour un·e utilisateur·rice non technique dans l'admin.

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\{\{gerer-cookies\}\})/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token === "{{gerer-cookies}}") {
      nodes.push(<ManageCookiesInlineButton key={`${keyPrefix}-c-${i}`} />);
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-[#464746]">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(
          href.startsWith("/") ? (
            <Link key={`${keyPrefix}-l-${i}`} href={href} className="underline hover:text-[#464746]">
              {label}
            </Link>
          ) : (
            <a
              key={`${keyPrefix}-l-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#464746]"
            >
              {label}
            </a>
          )
        );
      }
    }
    lastIndex = match.index + token.length;
    i++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function parseTableRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function renderLegalMarkdown(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const key = `h-${blockIndex++}`;
      blocks.push(
        <h2 key={key} className="mt-8 text-xl font-bold text-[#464746] first:mt-0">
          {renderInline(line.slice(3).trim(), key)}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      const key = `ul-${blockIndex++}`;
      blocks.push(
        <ul key={key} className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const header = parseTableRow(tableLines[0]);
      const dataRows = tableLines.slice(2).map(parseTableRow);
      const key = `table-${blockIndex++}`;
      blocks.push(
        <div key={key} className="mt-3 overflow-x-auto rounded border border-neutral-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#faf9f5]">
                {header.map((cell, idx) => (
                  <th
                    key={idx}
                    className="border-b border-neutral-200 px-4 py-3 font-semibold text-[#464746]"
                  >
                    {renderInline(cell, `${key}-th-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-neutral-200 last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 align-top">
                      {renderInline(cell, `${key}-td-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("|")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    const key = `p-${blockIndex++}`;
    blocks.push(
      <p key={key} className="mt-3 leading-relaxed">
        {renderInline(paraLines.join(" "), key)}
      </p>
    );
  }

  return blocks;
}
