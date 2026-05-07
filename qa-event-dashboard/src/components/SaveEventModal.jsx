"use client";

import { useReducer } from "react";
import { X } from "lucide-react";
import classnames from "classnames";
import { safeParse, prettyPrint } from "@/lib/helpers";

const PLATFORMS = ["firebase", "kinesis", "statsig"];

function formReducer(state, update) {
  return { ...state, ...update };
}

export default function SaveEventModal({ onSave, onClose, initialData }) {
  const isEdit = !!initialData;

  const [form, dispatch] = useReducer(formReducer, {
    name: initialData?.name ?? "",
    platform: initialData?.platform ?? "firebase",
    description: initialData?.description ?? "",
    payload: initialData?.payload ? prettyPrint(initialData.payload) : "",
    error: null,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      dispatch({ error: "Event name is required." });
      return;
    }

    const { data, error } = safeParse(form.payload);

    if (error) {
      dispatch({ error: `Invalid JSON: ${error}` });
      return;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      dispatch({ error: "Payload must be a JSON object ( {...} )." });
      return;
    }

    onSave({
      name: form.name.trim(),
      platform: form.platform,
      description: form.description.trim(),
      payload: data,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="w-[560px] max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-100 tracking-wide uppercase">
            {isEdit ? "Edit Baseline Event" : "Save Baseline Event"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Field label="Event Name *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => dispatch({ name: e.target.value, error: null })}
              placeholder="e.g. hp_click"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </Field>

          <Field label="Platform *">
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => dispatch({ platform: p })}
                  className={classnames(
                    "flex-1 py-1.5 text-xs font-mono rounded-sm border transition-colors capitalize",
                    form.platform === p
                      ? "border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400"
                      : "border-black dark:border-zinc-700 text-zinc-600 dark:text-zinc-500 hover:border-black hover:text-black dark:hover:text-zinc-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => dispatch({ description: e.target.value })}
              placeholder="Optional — brief note about this event"
              rows={2}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
          </Field>

          <Field label="Payload (JSON) *">
            <textarea
              value={form.payload}
              onChange={(e) => dispatch({ payload: e.target.value, error: null })}
              placeholder={'{\n  "event_name": "hp_click",\n  "params": {}\n}'}
              rows={10}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 resize-y"
              spellCheck={false}
            />
          </Field>

          {form.error && (
            <p className="text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm px-3 py-2">
              {form.error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 border border-black dark:border-zinc-700 hover:border-black rounded-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-sm transition-colors"
          >
            {isEdit ? "Save Changes" : "Save Baseline"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}
