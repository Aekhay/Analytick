"use client";

import classnames from "classnames";
import { LayoutDashboard, Zap, Cloud, CloudOff, Loader, CheckCircle, AlertCircle } from "lucide-react";

const TABS = [
  { id: "saved", label: "Saved Events", icon: LayoutDashboard },
  { id: "live",  label: "Compare Live", icon: Zap },
];

const SYNC_ICON = {
  idle:       { icon: CloudOff,    cls: "text-zinc-600",    border: "border-zinc-800",    spin: false },
  connecting: { icon: Loader,      cls: "text-yellow-500",  border: "border-yellow-800",  spin: true  },
  syncing:    { icon: Loader,      cls: "text-sky-500",     border: "border-sky-800",     spin: true  },
  synced:     { icon: CheckCircle, cls: "text-emerald-500", border: "border-emerald-800", spin: false },
  error:      { icon: AlertCircle, cls: "text-red-500",     border: "border-red-800",     spin: false },
};

export default function TopNav({ activeTab, onTabChange, syncStatus = "idle", onSyncClick }) {
  const sync = SYNC_ICON[syncStatus] ?? SYNC_ICON.idle;
  const SyncIcon = sync.icon;

  return (
    <header className="flex items-center gap-0 border-b border-zinc-800 bg-zinc-950 shrink-0 px-4">
      <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-widest pr-5 border-r border-zinc-800 mr-4 py-3">
        QA Event Dashboard
      </span>

      <nav className="flex items-center gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={classnames(
              "flex items-center gap-2 px-3 py-2.5 text-[12px] font-mono transition-colors border-b-2 -mb-px",
              activeTab === id
                ? "border-b-sky-500 text-zinc-100"
                : "border-b-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </nav>

      <button
        onClick={onSyncClick}
        title={syncStatus === "synced" ? "Synced to GitHub Gist" : syncStatus === "error" ? "Sync error — click to manage" : "GitHub Gist Sync"}
        className={classnames(
          "ml-auto flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-sm border transition-colors",
          sync.border, sync.cls,
          "hover:opacity-80"
        )}
      >
        <SyncIcon size={12} className={classnames(sync.cls, sync.spin && "animate-spin")} />
        <span className="hidden sm:inline">
          {syncStatus === "synced" ? "Synced" : syncStatus === "error" ? "Sync error" : syncStatus === "syncing" || syncStatus === "connecting" ? "Syncing…" : "Sync"}
        </span>
      </button>
    </header>
  );
}
