"use client";

import { useReducer, useRef } from "react";
import { X, EyeOff, Plus } from "lucide-react";
import classnames from "classnames";

function barReducer(state, update) {
  return { ...state, ...update };
}

export default function IgnoredKeysBar({ ignoredKeys, onAdd, onRemove }) {
  const [{ inputValue, focused }, dispatch] = useReducer(barReducer, {
    inputValue: "",
    focused: false,
  });
  const inputRef = useRef(null);

  const commit = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      dispatch({ inputValue: "" });
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-950/80 flex-wrap min-h-[38px]">
      <div className="flex items-center gap-1.5 shrink-0">
        <EyeOff size={11} className="text-zinc-600" />
        <span className="text-[11px] font-mono font-semibold text-zinc-600 uppercase tracking-widest">
          Ignore fields
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {ignoredKeys.map((key) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] font-mono px-1.5 py-0.5 rounded-sm"
          >
            {key}
            <button
              onClick={() => onRemove(key)}
              className="text-zinc-600 hover:text-red-400 transition-colors ml-0.5"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <div
          className={classnames(
            "flex items-center gap-1 border rounded-sm px-1.5 py-0.5 transition-colors",
            focused
              ? "border-zinc-600 bg-zinc-900"
              : "border-zinc-800 bg-transparent"
          )}
        >
          <Plus size={10} className="text-zinc-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => dispatch({ inputValue: e.target.value })}
            onFocus={() => dispatch({ focused: true })}
            onBlur={() => { dispatch({ focused: false }); commit(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                dispatch({ inputValue: "", focused: false });
                inputRef.current?.blur();
              }
            }}
            placeholder="add key..."
            className="bg-transparent text-[11px] font-mono text-zinc-400 placeholder:text-zinc-700 outline-none w-20"
          />
        </div>
      </div>

      {ignoredKeys.length > 0 && (
        <span className="text-[10px] font-mono text-zinc-700 shrink-0">
          {ignoredKeys.length} ignored
        </span>
      )}
    </div>
  );
}
