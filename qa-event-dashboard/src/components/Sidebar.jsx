"use client";

import { useState } from "react";
import { Search, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import classnames from "classnames";
import PlatformBadge from "./PlatformBadge";

const PLATFORMS = ["firebase", "kinesis", "statsig"];

export default function Sidebar({ events, selectedEventId, onSelect, onDelete, onNewEvent }) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = PLATFORMS.reduce((acc, p) => {
    acc[p] = filtered.filter((e) => e.platform === p);
    return acc;
  }, {});

  return (
    <aside className="w-64 min-w-[256px] flex flex-col border-r border-zinc-800 bg-zinc-950 h-full overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-sm font-bold font-mono text-zinc-100 tracking-wide uppercase">
          QA Events
        </span>
        <button
          onClick={onNewEvent}
          className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 border border-zinc-700 hover:border-zinc-500 rounded-sm transition-colors"
        >
          <Plus size={12} />
          New
        </button>
      </div>

      <div className="px-3 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-sm px-2 py-1.5">
          <Search size={12} className="text-zinc-600 shrink-0" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-mono text-zinc-300 placeholder:text-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {PLATFORMS.map((platform) => {
          const group = grouped[platform];
          if (group.length === 0) return null;

          const isCollapsed = collapsed[platform];

          return (
            <div key={platform} className="mb-1">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [platform]: !c[platform] }))}
                className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors"
              >
                {isCollapsed
                  ? <ChevronRight size={11} />
                  : <ChevronDown size={11} />
                }
                {platform}
                <span className="ml-auto text-[10px] text-zinc-700">{group.length}</span>
              </button>

              {!isCollapsed && group.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  isSelected={event.id === selectedEventId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-4 py-6 text-xs font-mono text-zinc-600 text-center">
            No events found
          </p>
        )}
      </nav>
    </aside>
  );
}

function EventRow({ event, isSelected, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={classnames(
        "group flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors relative",
        "border-l-2",
        isSelected
          ? "border-l-sky-500 bg-sky-500/8 text-zinc-100"
          : "border-l-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
      )}
      onClick={() => onSelect(event.id)}
    >
      <span className="flex-1 truncate text-xs font-mono">{event.name}</span>

      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
          className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
