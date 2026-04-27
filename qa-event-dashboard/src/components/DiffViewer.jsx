"use client";

import { useMemo, useReducer, useEffect, useRef } from "react";
import { ArrowLeftRight, RotateCcw, Copy, Check, Pencil, Save, X, ShieldCheck, Play, Braces } from "lucide-react";
import classnames from "classnames";
import JsonEditor from "./JsonEditor";
import DiffSummary from "./DiffSummary";
import PlatformBadge from "./PlatformBadge";
import IgnoredKeysBar from "./IgnoredKeysBar";
import { comparePayloads, buildDiffMap } from "@/lib/diff";
import { safeParse, reorderToMatch, prettyPrint } from "@/lib/helpers";
import { useSyncScroll } from "@/hooks/useSyncScroll";

const paneReducer = (s, u) => ({ ...s, ...u });

export default function DiffViewer({
  selectedEvent,
  actualPayload,
  reorderActive,
  ignoredKeys,
  onActualChange,
  onToggleReorder,
  onAddIgnoredKey,
  onRemoveIgnoredKey,
  onUpdateBaseline,
}) {
  const [{ copied }, dispatchCopy] = useReducer(paneReducer, { copied: false });
  const [{ editing, draftText, parseError: draftError }, dispatchEdit] = useReducer(
    paneReducer,
    { editing: false, draftText: "", parseError: null }
  );
  const [{ compareData }, dispatchCompare] = useReducer(paneReducer, { compareData: null });

  const baselineScrollRef = useRef(null);
  const actualScrollRef = useRef(null);
  useSyncScroll(baselineScrollRef, actualScrollRef);

  const { data: actualData, error: parseError } = useMemo(
    () => safeParse(actualPayload),
    [actualPayload]
  );

  const diffResult = useMemo(() => {
    if (!selectedEvent || !compareData) return null;
    return comparePayloads(selectedEvent.payload, compareData, ignoredKeys);
  }, [selectedEvent, compareData, ignoredKeys]);

  const hasPendingChanges = actualData && actualData !== compareData;

  useEffect(() => {
    dispatchCompare({ compareData: null });
  }, [selectedEvent?.id]);

  const diffMap = useMemo(() => {
    if (!diffResult) return {};
    return buildDiffMap(diffResult);
  }, [diffResult]);

  const reorderedActual = useMemo(() => {
    if (!selectedEvent || !actualData) return null;
    return prettyPrint(reorderToMatch(selectedEvent.payload, actualData));
  }, [selectedEvent, actualData]);

  const baselineText = selectedEvent ? prettyPrint(selectedEvent.payload) : "";
  const displayActual = reorderActive
    ? (reorderedActual ?? actualPayload)
    : actualPayload;
  const copyText = reorderedActual ?? actualPayload;

  const startEditing = () => {
    dispatchEdit({ editing: true, draftText: baselineText, parseError: null });
  };

  const cancelEditing = () => {
    dispatchEdit({ editing: false, draftText: "", parseError: null });
  };

  const saveBaseline = () => {
    const { data, error } = safeParse(draftText);
    if (error) {
      dispatchEdit({ parseError: `Invalid JSON: ${error}` });
      return;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      dispatchEdit({ parseError: "Payload must be a JSON object { ... }" });
      return;
    }
    onUpdateBaseline(selectedEvent.id, data);
    dispatchEdit({ editing: false, draftText: "", parseError: null });
  };

  if (!selectedEvent) {
    return (
      <main className="flex-1 flex items-center justify-center text-zinc-700 font-mono text-sm">
        <div className="text-center space-y-2">
          <ArrowLeftRight size={32} className="mx-auto opacity-30" />
          <p>Select a baseline event from the sidebar</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <IgnoredKeysBar
        ignoredKeys={ignoredKeys}
        onAdd={onAddIgnoredKey}
        onRemove={onRemoveIgnoredKey}
      />

      {/* match badge bar — only shown when all key names are present on both sides */}
      {diffResult && diffResult.missingKeys.length === 0 && diffResult.addedKeys.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-950/30 border-b border-emerald-800 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500 text-black text-[11px] font-mono font-bold tracking-wide">
            <ShieldCheck size={12} />
            All keys match · case-sensitive
          </span>
          <span className="text-[11px] font-mono text-emerald-700">
            {diffResult.summary.total} fields verified
          </span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 divide-x divide-zinc-800 overflow-hidden">
        {/* ── Baseline pane ── */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950 shrink-0">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              Baseline
            </span>
            <span className="text-xs font-mono text-zinc-300 truncate">
              {selectedEvent.name}
            </span>
            <PlatformBadge platform={selectedEvent.platform} />

            <div className="ml-auto flex items-center gap-2">
              {editing
                ? (
                  <>
                    <button
                      onClick={() => {
                        const { data } = safeParse(draftText);
                        if (data) dispatchEdit({ draftText: prettyPrint(data), parseError: null });
                      }}
                      title="Format JSON"
                      className="flex items-center justify-center w-6 h-6 rounded-sm border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <Braces size={11} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <X size={11} />
                      Cancel
                    </button>
                    <button
                      onClick={saveBaseline}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border border-emerald-600 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Save size={11} />
                      Save baseline
                    </button>
                  </>
                )
                : (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                )
              }
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <JsonEditor
              ref={baselineScrollRef}
              value={editing ? draftText : baselineText}
              onChange={editing ? (v) => dispatchEdit({ draftText: v, parseError: null }) : undefined}
              readOnly={!editing}
              diffMap={editing ? {} : diffMap}
            />
            {draftError && (
              <div className="px-4 py-2 bg-red-950/40 border-t border-red-900 text-xs font-mono text-red-400 shrink-0">
                {draftError}
              </div>
            )}
          </div>
        </section>

        {/* ── Actual pane ── */}
        <Pane
          title="Actual"
          label="Paste new payload →"
          extra={
            actualData && (
              <div className="flex items-center gap-2">
                <button
                  title="Format JSON"
                  onClick={() => {
                    if (!actualData) return;
                    onActualChange(prettyPrint(actualData));
                  }}
                  className="flex items-center justify-center w-6 h-6 rounded-sm border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Braces size={11} />
                </button>
                <button
                  onClick={() => {
                    if (!actualData) return;
                    dispatchCompare({ compareData: actualData });
                  }}
                  className={classnames(
                    hasPendingChanges
                      ? "border-sky-400 text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 animate-pulse"
                      : "border-sky-600 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20"
                  )}
                >
                  <Play size={10} />
                  Compare
                </button>
                <button
                  title={reorderedActual ? "Copy reordered JSON" : "Copy JSON"}
                  onClick={() => {
                    navigator.clipboard.writeText(copyText).then(() => {
                      dispatchCopy({ copied: true });
                      setTimeout(() => dispatchCopy({ copied: false }), 1800);
                    });
                  }}
                  className={classnames(
                    "flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border transition-all",
                    copied
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy"}
                </button>

                <button
                  onClick={onToggleReorder}
                  className={classnames(
                    "flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-sm border transition-colors",
                    reorderActive
                      ? "border-sky-500 text-sky-400 bg-sky-500/10"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <RotateCcw size={11} />
                  Reorder to match
                </button>
              </div>
            )
          }
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <JsonEditor
                ref={actualScrollRef}
                value={displayActual}
                onChange={reorderActive ? undefined : onActualChange}
                readOnly={reorderActive}
                diffMap={diffMap}
              />
            </div>

            {parseError && actualPayload.trim() && (
              <div className="px-4 py-2 bg-red-950/40 border-t border-red-900 text-xs font-mono text-red-400">
                JSON parse error: {parseError}
              </div>
            )}
          </div>
        </Pane>
      </div>

      <DiffSummary diffResult={diffResult} hasPayload={!!actualData} />
    </main>
  );
}

function Pane({ title, label, platform, badge, badgeColor, extra, children }) {
  return (
    <section className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
          {title}
        </span>
        <span className="text-xs font-mono text-zinc-300 truncate">{label}</span>
        {platform && <PlatformBadge platform={platform} />}
        {badge && (
          <span className={classnames("text-[10px] font-mono ml-1", badgeColor)}>
            {badge}
          </span>
        )}
        {extra && <div className="ml-auto">{extra}</div>}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </section>
  );
}
