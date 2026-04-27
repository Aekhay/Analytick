"use client";

import classnames from "classnames";
import { LayoutDashboard, Zap } from "lucide-react";

const TABS = [
  { id: "saved", label: "Saved Events", icon: LayoutDashboard },
  { id: "live",  label: "Compare Live", icon: Zap },
];

export default function TopNav({ activeTab, onTabChange }) {
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
    </header>
  );
}
