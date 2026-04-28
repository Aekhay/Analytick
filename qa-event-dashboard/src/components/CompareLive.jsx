"use client";

import { useReducer, useMemo, useRef } from "react";
import { Copy, Check, RotateCcw, Trash2, ArrowLeftRight, ShieldCheck, Play, Braces } from "lucide-react";
import classnames from "classnames";
import JsonEditor from "./JsonEditor";
import DiffSummary from "./DiffSummary";
import IgnoredKeysBar from "./IgnoredKeysBar";
import { comparePayloads, buildDiffMap } from "@/lib/diff";
import { safeParse, reorderToMatch, prettyPrint } from "@/lib/helpers";
import { useSyncScroll } from "@/hooks/useSyncScroll";

const initState = {
  leftText: "",
  rightText: "",
  reorderActive: false,
  copiedLeft: false,
  copiedRight: false,
  compareLeft: null,
  compareRight: null,
};

function reducer(s, u) {
  return { ...s, ...u };
}

function countKeys(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return 0;
  return Object.keys(obj).reduce((sum, k) => sum + 1 + countKeys(obj[k]), 0);
}

export default function CompareLive({ ignoredKeys, onAddIgnoredKey, onRemoveIgnoredKey }) {
  const [state, dispatch] = useReducer(reducer, initState);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  useSyncScroll(leftScrollRef, rightScrollRef);

  const { data: leftData, error: leftError } = useMemo(
    () => safeParse(state.leftText),
    [state.leftText]
  );
  const { data: rightData, error: rightError } = useMemo(
    () => safeParse(state.rightText),
    [state.rightText]
  );

  const diffResult = useMemo(() => {
    if (!state.compareLeft || !state.compareRight) return null;
    return comparePayloads(state.compareLeft, state.compareRight, ignoredKeys);
  }, [state.compareLeft, state.compareRight, ignoredKeys]);

  const hasPendingChanges =
    leftData && rightData &&
    (leftData !== state.compareLeft || rightData !== state.compareRight);

  const diffMap = useMemo(() => {
    if (!diffResult) return {};
    return buildDiffMap(diffResult);
  }, [diffResult]);

  const reorderedRight = useMemo(() => {
    if (!leftData || !rightData) return null;
    return prettyPrint(reorderToMatch(leftData, rightData));
  }, [leftData, rightData]);

  const displayRight = state.reorderActive
    ? (reorderedRight ?? state.rightText)
    : state.rightText;

  const copyText = (text) => navigator.clipboard.writeText(text).catch(() => {});
  const swap = () =>
    dispatch({ leftText: state.rightText, rightText: state.leftText, reorderActive: false, compareLeft: null, compareRight: null });

  const isEmpty = !state.leftText.trim() && !state.rightText.trim();
  // Keys match = same structure on both sides regardless of values
  const keysMatch =
    diffResult !== null &&
    diffResult.missingKeys.length === 0 &&
    diffResult.addedKeys.length === 0;

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <IgnoredKeysBar
        ignoredKeys={ignoredKeys}
        onAdd={onAddIgnoredKey}
        onRemove={onRemoveIgnoredKey}
      />

      {/* action bar */}
      <div
        className={classnames(
          "flex items-center gap-3 px-4 py-2 border-b shrink-0 transition-colors duration-300",
          keysMatch
            ? "border-emerald-800 bg-emerald-950/30"
            : "border-zinc-800 bg-zinc-950/60"
        )}
      >
        <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest">
          Quick Compare
        </span>

        {/* ── Compare button ── */}
        <button
          onClick={() => {
            if (!leftData || !rightData) return;
            dispatch({ compareLeft: leftData, compareRight: rightData });
          }}
          disabled={!leftData || !rightData}
          className={classnames(
            "flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-sm border transition-colors",
            hasPendingChanges
              ? "border-sky-400 text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 animate-pulse"
              : leftData && rightData
              ? "border-sky-600 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20"
              : "border-zinc-700 text-zinc-600 opacity-40 cursor-not-allowed"
          )}
        >
          <Play size={10} />
          Compare
        </button>

        {/* ── Match badge ── */}
        {keysMatch && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500 text-black text-[11px] font-mono font-bold tracking-wide animate-pulse-once">
            <ShieldCheck size={12} />
            All keys match · case-sensitive
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {leftData && rightData && (
            <button
              onClick={() => dispatch({ reorderActive: !state.reorderActive })}
              className={classnames(
                "flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border transition-colors",
                state.reorderActive
                  ? "border-sky-500 text-sky-400 bg-sky-500/10"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
              )}
            >
              <RotateCcw size={11} />
              Reorder right to match left
            </button>
          )}

          <button
            onClick={swap}
            disabled={!state.leftText && !state.rightText}
            className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftRight size={11} />
            Swap
          </button>

          {!isEmpty && (
            <button
              onClick={() => dispatch({ leftText: "", rightText: "", reorderActive: false, compareLeft: null, compareRight: null })}
              className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border border-zinc-700 text-zinc-500 hover:border-red-500 hover:text-red-400 hover:border-red-500/50 transition-colors"
            >
              <Trash2 size={11} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* editors */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-zinc-800 overflow-hidden">
        {/* Left */}
        <section
          className={classnames(
            "flex flex-col overflow-hidden transition-colors duration-300",
            keysMatch && "border-r border-emerald-900/40"
          )}
        >
          <PaneHeader label="Left — Reference" allMatch={keysMatch}>
            <div className="flex items-center gap-2">
              {leftData && (
                <>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400 tabular-nums">
                    {countKeys(leftData)} keys
                  </span>
                  <div className="w-px h-3 bg-zinc-800 shrink-0" />
                </>
              )}
              <div className="flex items-center gap-1">
                {leftData && (
                  <FormatButton onClick={() => dispatch({ leftText: prettyPrint(leftData) })} />
                )}
                {state.leftText.trim() && (
                  <CopyButton
                    copied={state.copiedLeft}
                    onClick={() => {
                      copyText(state.leftText);
                      dispatch({ copiedLeft: true });
                      setTimeout(() => dispatch({ copiedLeft: false }), 1800);
                    }}
                  />
                )}
              </div>
            </div>
          </PaneHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <JsonEditor
              ref={leftScrollRef}
              value={state.leftText}
              onChange={(v) => dispatch({ leftText: v })}
              diffMap={diffMap}
            />
            {leftError && state.leftText.trim() && <ParseError msg={leftError} />}
          </div>
        </section>

        {/* Right */}
        <section className="flex flex-col overflow-hidden">
          <PaneHeader label="Right — Compare" allMatch={keysMatch}>
            <div className="flex items-center gap-2">
              {rightData && (
                <>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400 tabular-nums">
                    {countKeys(rightData)} keys
                  </span>
                  <div className="w-px h-3 bg-zinc-800 shrink-0" />
                </>
              )}
              <div className="flex items-center gap-1">
                {rightData && !state.reorderActive && (
                  <FormatButton onClick={() => dispatch({ rightText: prettyPrint(rightData) })} />
                )}
                {state.rightText.trim() && (
                  <CopyButton
                    copied={state.copiedRight}
                    label={reorderedRight ? "Copy reordered" : "Copy"}
                    onClick={() => {
                      copyText(reorderedRight ?? state.rightText);
                      dispatch({ copiedRight: true });
                      setTimeout(() => dispatch({ copiedRight: false }), 1800);
                    }}
                  />
                )}
              </div>
            </div>
          </PaneHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <JsonEditor
              ref={rightScrollRef}
              value={displayRight}
              onChange={state.reorderActive ? undefined : (v) => dispatch({ rightText: v })}
              readOnly={state.reorderActive}
              diffMap={diffMap}
            />
            {rightError && state.rightText.trim() && <ParseError msg={rightError} />}
          </div>
        </section>
      </div>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2 text-zinc-700 font-mono text-sm">
            <ArrowLeftRight size={32} className="mx-auto opacity-20" />
            <p>Paste JSON into either pane to begin</p>
          </div>
        </div>
      )}

      <DiffSummary diffResult={diffResult} hasPayload={!!(leftData && rightData)} />
    </main>
  );
}

function PaneHeader({ label, allMatch, children }) {
  return (
    <div
      className={classnames(
        "flex items-center gap-2 px-4 py-2.5 border-b shrink-0 transition-colors duration-300",
        allMatch
          ? "border-emerald-800/60 bg-emerald-950/20"
          : "border-zinc-800 bg-zinc-950"
      )}
    >
      <span
        className={classnames(
          "text-[11px] font-mono font-bold uppercase tracking-widest transition-colors duration-300",
          allMatch ? "text-emerald-600" : "text-zinc-500"
        )}
      >
        {label}
      </span>
      {allMatch && (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600">
          <Check size={10} strokeWidth={3} />
          match
        </span>
      )}
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}

function CopyButton({ copied, label = "Copy", onClick }) {
  return (
    <button
      onClick={onClick}
      className={classnames(
        "flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border transition-all",
        copied
          ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
          : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
      )}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function FormatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Format JSON"
      className="flex items-center justify-center w-6 h-6 rounded-sm border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
    >
      <Braces size={11} />
    </button>
  );
}

function ParseError({ msg }) {
  return (
    <div className="px-4 py-2 bg-red-950/40 border-t border-red-900 text-xs font-mono text-red-400 shrink-0">
      JSON parse error: {msg}
    </div>
  );
}
