import type { ReactNode } from "react";

/**
 * Minimal, safe renderer for admin-edited text. Supports:
 * paragraphs (blank line), "## " / "### " headings, "- " bullet lists, **bold** and [links](https://…).
 * No HTML is ever injected.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:|tel:)[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${keyBase}-b${i++}`}>{m[1]}</strong>);
    else {
      const external = /^https?:/.test(m[3]);
      out.push(
        <a key={`${keyBase}-a${i++}`} href={m[3]} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {m[2]}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text, className = "prose-content" }: { text: string; className?: string }) {
  const blocks = (text ?? "").replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const nodes: ReactNode[] = [];
  blocks.forEach((block, bi) => {
    const lines = block.split("\n");
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => {
      if (para.length) nodes.push(<p key={`p${bi}-${nodes.length}`}>{inline(para.join(" "), `p${bi}-${nodes.length}`)}</p>);
      para = [];
    };
    const flushList = () => {
      if (list.length)
        nodes.push(
          <ul key={`u${bi}-${nodes.length}`}>
            {list.map((li, k) => (
              <li key={k}>{inline(li, `l${bi}-${k}`)}</li>
            ))}
          </ul>,
        );
      list = [];
    };
    for (const line of lines) {
      if (line.startsWith("### ")) {
        flushPara(); flushList();
        nodes.push(<h3 key={`h3${bi}-${nodes.length}`}>{line.slice(4)}</h3>);
      } else if (line.startsWith("## ")) {
        flushPara(); flushList();
        nodes.push(<h2 key={`h2${bi}-${nodes.length}`}>{line.slice(3)}</h2>);
      } else if (/^[-*] /.test(line)) {
        flushPara();
        list.push(line.slice(2));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  });
  return <div className={className}>{nodes}</div>;
}
