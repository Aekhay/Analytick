"use client";

import classnames from "classnames";

export default function DiffSummary({ diffResult, hasPayload }) {
  if (!hasPayload || !diffResult) {
    return (
      <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center gap-3">
        <span className="text-xs font-mono text-zinc-600">
          — Paste an actual payload on the right to start comparison
        </span>
      </div>
    );
  }

  const { isEqual, missingKeys, addedKeys, changedValues, summary } = diffResult;
  const passing = isEqual;

  return (
    <div
      className={classnames(
        "border-t flex items-center gap-4 px-6 py-3 font-mono text-sm flex-wrap",
        passing ? "border-emerald-900 bg-emerald-950/40" : "border-red-900 bg-red-950/20"
      )}
    >
      <span
        className={classnames(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase",
          passing ? "bg-emerald-500 text-black" : "bg-red-500 text-white"
        )}
      >
        {passing ? "✓ PASS" : "✗ FAIL"}
      </span>

      <div className="flex items-center gap-3 text-xs">
        {missingKeys.length > 0 && (
          <Pill color="red" label="missing" count={missingKeys.length} />
        )}
        {addedKeys.length > 0 && (
          <Pill color="yellow" label="added" count={addedKeys.length} />
        )}
        {changedValues.length > 0 && (
          <Pill color="orange" label="changed" count={changedValues.length} />
        )}
        {diffResult.ignoredCount > 0 && (
          <Pill color="zinc" label="ignored" count={diffResult.ignoredCount} />
        )}
        {passing && (
          <span className="text-emerald-500">All {summary.total} fields match</span>
        )}
      </div>

      <span className="ml-auto text-zinc-600 text-xs">
        {summary.passed}/{summary.total} fields passed
      </span>
    </div>
  );
}

function Pill({ color, label, count }) {
  const colorMap = {
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    zinc: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
  };

  return (
    <span
      className={classnames(
        "inline-flex items-center gap-1 border px-2 py-0.5 rounded-sm",
        colorMap[color]
      )}
    >
      <strong>{count}</strong> {label}
    </span>
  );
}
