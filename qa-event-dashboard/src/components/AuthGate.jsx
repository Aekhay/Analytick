"use client";

import { useReducer, useEffect } from "react";
import classnames from "classnames";
import { Lock } from "lucide-react";

const SESSION_KEY = "qa_auth_ok";
const PASSWORD = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD;

function reducer(s, u) {
  return { ...s, ...u };
}

export default function AuthGate({ children }) {
  const [{ checked, authed, input, error, submitting }, dispatch] = useReducer(reducer, {
    checked: false,
    authed: false,
    input: "",
    error: null,
    submitting: false,
  });

  useEffect(() => {
    if (!PASSWORD) {
      dispatch({ checked: true, authed: true });
      return;
    }
    try {
      dispatch({ checked: true, authed: sessionStorage.getItem(SESSION_KEY) === "1" });
    } catch {
      dispatch({ checked: true, authed: false });
    }
  }, []);

  if (!checked) return null;
  if (authed) return children;

  const submit = () => {
    if (!input.trim()) {
      dispatch({ error: "Password is required." });
      return;
    }
    dispatch({ submitting: true, error: null });

    if (input === PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      dispatch({ authed: true, submitting: false });
    } else {
      dispatch({ error: "Incorrect password.", input: "", submitting: false });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
      <div className="w-80 flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-2xl overflow-hidden">
        <header className="flex items-center gap-2 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Lock size={13} className="text-zinc-500 dark:text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 tracking-wide">
            QA Event Dashboard
          </h1>
        </header>

        <div className="px-5 py-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter the dashboard password to continue.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => dispatch({ input: e.target.value, error: null })}
              onKeyDown={(e) => e.key === "Enter" && !submitting && submit()}
              placeholder="••••••••"
              className={classnames(
                "w-full bg-zinc-50 dark:bg-zinc-900 border rounded-sm px-3 py-2 text-sm font-mono",
                "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                "focus:outline-none focus:border-zinc-500",
                error
                  ? "border-red-400 dark:border-red-500"
                  : "border-zinc-300 dark:border-zinc-700"
              )}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full py-2 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
