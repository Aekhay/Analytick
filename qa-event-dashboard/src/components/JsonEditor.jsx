"use client";

import { useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-json";
import classnames from "classnames";

export default function JsonEditor({ value, onChange, readOnly = false, diffMap = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || Object.keys(diffMap).length === 0) return;

    const timer = setTimeout(() => {
      applyDiffHighlights(containerRef.current, diffMap);
    }, 50);

    return () => clearTimeout(timer);
  }, [value, diffMap]);

  return (
    <div
      ref={containerRef}
      className={classnames(
        "relative h-full overflow-auto font-mono text-sm",
        "bg-[#0a0a0a] text-zinc-200",
        "[&_.token.string]:text-emerald-400",
        "[&_.token.number]:text-sky-400",
        "[&_.token.boolean]:text-amber-400",
        "[&_.token.null]:text-red-400",
        "[&_.token.property]:text-zinc-100",
        "[&_.token.punctuation]:text-zinc-500"
      )}
    >
      <Editor
        value={value}
        onValueChange={onChange ?? (() => {})}
        highlight={(code) => highlight(code, languages.json, "json")}
        padding={16}
        readOnly={readOnly}
        style={{
          fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
          fontSize: 13,
          lineHeight: "1.6",
          minHeight: "100%",
          background: "transparent",
          caretColor: "#fff",
        }}
        textareaClassName="focus:outline-none"
      />
    </div>
  );
}

/**
 * Post-render pass: walk rendered lines and apply background color
 * to lines that contain a diff-flagged key.
 */
function applyDiffHighlights(container, diffMap) {
  const pre = container?.querySelector("pre");
  if (!pre) return;

  const lines = pre.innerHTML.split("\n");

  const highlighted = lines.map((line) => {
    const strippedLine = line.replace(/<[^>]+>/g, "");
    const keyMatch = strippedLine.match(/^\s*"([^"]+)"\s*:/);
    if (!keyMatch) return `<span>${line}</span>`;

    const key = keyMatch[1];
    const matchedPath = Object.keys(diffMap).find(
      (p) => p === key || p.endsWith(`.${key}`)
    );

    if (!matchedPath) return `<span>${line}</span>`;

    const diffType = diffMap[matchedPath];
    const bgClass =
      diffType === "missing"
        ? "diff-missing"
        : diffType === "added"
        ? "diff-added"
        : "diff-changed";

    return `<span class="block w-full ${bgClass}">${line}</span>`;
  });

  pre.innerHTML = highlighted.join("\n");
}
