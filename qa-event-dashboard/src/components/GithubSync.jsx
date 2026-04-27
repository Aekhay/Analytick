"use client";

import { useReducer } from "react";
import { X, Cloud, CloudOff, ExternalLink, Loader, CheckCircle, AlertCircle } from "lucide-react";
import classnames from "classnames";

const SYNC_UI = {
  idle:       { icon: CloudOff,      color: "text-zinc-500",   border: "border-zinc-800",   bg: "bg-zinc-900",        label: "Not connected" },
  connecting: { icon: Loader,        color: "text-yellow-400", border: "border-yellow-800", bg: "bg-yellow-950/20",   label: "Connecting…",   spin: true },
  syncing:    { icon: Loader,        color: "text-sky-400",    border: "border-sky-800",    bg: "bg-sky-950/20",      label: "Syncing…",      spin: true },
  synced:     { icon: CheckCircle,   color: "text-emerald-400",border: "border-emerald-800",bg: "bg-emerald-950/20",  label: "Synced to GitHub" },
  error:      { icon: AlertCircle,   color: "text-red-400",    border: "border-red-800",    bg: "bg-red-950/20",      label: "Sync error" },
};

const initialForm = { token: "", error: null, connecting: false };

function formReducer(s, u) {
  return { ...s, ...u };
}

export default function GithubSync({ syncStatus, syncError, gistId, githubToken, onConnect, onDisconnect, onClose }) {
  const [form, dispatch] = useReducer(formReducer, initialForm);

  const connected = !!githubToken && !!gistId;
  const ui = SYNC_UI[syncStatus] ?? SYNC_UI.idle;
  const StatusIcon = ui.icon;

  const handleConnect = async () => {
    if (!form.token.trim()) {
      dispatch({ error: "Personal Access Token is required." });
      return;
    }
    dispatch({ connecting: true, error: null });
    try {
      await onConnect(form.token.trim());
    } catch (e) {
      dispatch({ error: e.message || "Connection failed. Check your token and try again.", connecting: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[480px] flex flex-col bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Cloud size={13} className="text-zinc-400" />
            <h2 className="text-sm font-bold font-mono text-zinc-100 tracking-wide uppercase">
              GitHub Gist Sync
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-5 space-y-4">
          {/* Status bar */}
          <div
            className={classnames(
              "flex items-center gap-2 px-3 py-2.5 rounded-sm border text-xs font-mono",
              ui.color, ui.border, ui.bg
            )}
          >
            <StatusIcon size={13} className={classnames(ui.color, ui.spin && "animate-spin")} />
            <span>{ui.label}</span>
            {syncError && syncStatus === "error" && (
              <span className="text-red-300 ml-1">— {syncError}</span>
            )}
            {gistId && (
              <a
                href={`https://gist.github.com/${gistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                View Gist <ExternalLink size={10} />
              </a>
            )}
          </div>

          {!connected
            ? (
              <>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Connect a GitHub Personal Access Token with{" "}
                  <code className="text-zinc-300 bg-zinc-800 px-1 rounded">gist</code> scope.
                  Your events are stored in a private Gist and sync automatically across any device.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-widest">
                    Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={form.token}
                    onChange={(e) => dispatch({ token: e.target.value, error: null })}
                    onKeyDown={(e) => e.key === "Enter" && !form.connecting && handleConnect()}
                    placeholder="github_pat_…"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <p className="text-[11px] font-mono text-zinc-600">
                    Generate at{" "}
                    <a
                      href="https://github.com/settings/tokens/new?scopes=gist&description=QA+Event+Dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-500 hover:text-sky-400 underline"
                    >
                      github.com/settings/tokens
                    </a>
                    {" "}— only the <code className="text-zinc-400">gist</code> scope is needed.
                  </p>
                </div>

                {form.error && (
                  <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
                    {form.error}
                  </p>
                )}

                <button
                  onClick={handleConnect}
                  disabled={form.connecting}
                  className="w-full py-2 text-xs font-mono font-bold text-black bg-white hover:bg-zinc-200 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {form.connecting ? "Connecting…" : "Connect & Sync"}
                </button>
              </>
            )
            : (
              <>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Events are automatically synced to a private GitHub Gist.
                  Sign in on any device with the same token to access them.
                </p>
                <button
                  onClick={() => { onDisconnect(); onClose(); }}
                  className="w-full py-2 text-xs font-mono border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                >
                  Disconnect &amp; use local storage only
                </button>
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}
