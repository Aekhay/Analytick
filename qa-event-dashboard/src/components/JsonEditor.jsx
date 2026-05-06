"use client";

import { useCallback, forwardRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-json";
import classnames from "classnames";

const JsonEditor = forwardRef(function JsonEditor(
  { value, onChange, readOnly = false, diffMap = {} },
  ref
) {
  const hasDiff = Object.keys(diffMap).length > 0;

  const highlightCode = useCallback(
    (code) => {
      const prismHighlighted = highlight(code, languages.json, "json");
      if (!hasDiff) return prismHighlighted;

      return prismHighlighted
        .split("\n")
        .map((line) => {
          const strippedLine = line.replace(/<[^>]+>/g, "");
          const keyMatch = strippedLine.match(/^\s*"([^"]+)"\s*:/);
          if (!keyMatch) return line;

          const key = keyMatch[1];
          const matchedPath = Object.keys(diffMap).find(
            (p) => p === key || p.endsWith(`.${key}`)
          );

          if (!matchedPath) return line;

          const diffType = diffMap[matchedPath];
          const bgClass =
            diffType === "missing"
              ? "diff-missing"
              : diffType === "added"
              ? "diff-added"
              : "diff-changed";

          return `<span class="block w-full ${bgClass}">${line}</span>`;
        })
        .join("\n");
    },
    [diffMap, hasDiff]
  );

  return (
    <div
      ref={ref}
      className={classnames(
        "relative h-full overflow-auto font-mono text-sm",
        "bg-[var(--editor-bg)]"
      )}
    >
      <Editor
        value={value}
        onValueChange={onChange ?? (() => {})}
        highlight={highlightCode}
        padding={16}
        readOnly={readOnly}
        style={{
          fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
          fontSize: 13,
          lineHeight: "1.6",
          minHeight: "100%",
          background: "transparent",
          caretColor: "var(--editor-caret)",
        }}
        textareaClassName="focus:outline-none"
      />
    </div>
  );
});

export default JsonEditor;
