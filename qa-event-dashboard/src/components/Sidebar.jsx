"use client";

import { useReducer } from "react";
import { Search, Plus, Trash2, ChevronDown, ChevronRight, Info, X } from "lucide-react";
import classnames from "classnames";
import PlatformBadge from "./PlatformBadge";

const PLATFORMS = ["firebase", "kinesis", "statsig"];

const PLATFORM_STYLES = {
  firebase: {
    header: "text-orange-500 hover:text-orange-400 dark:text-orange-400 dark:hover:text-orange-300",
    count: "text-orange-500 dark:text-orange-600",
    selectedBorder: "border-l-orange-400",
    selectedBg: "bg-orange-400/10",
    hoverBorder: "hover:border-l-orange-400/40",
  },
  kinesis: {
    header: "text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300",
    count: "text-blue-500 dark:text-blue-600",
    selectedBorder: "border-l-blue-400",
    selectedBg: "bg-blue-400/10",
    hoverBorder: "hover:border-l-blue-400/40",
  },
  statsig: {
    header: "text-purple-500 hover:text-purple-400 dark:text-purple-400 dark:hover:text-purple-300",
    count: "text-purple-500 dark:text-purple-600",
    selectedBorder: "border-l-purple-400",
    selectedBg: "bg-purple-400/10",
    hoverBorder: "hover:border-l-purple-400/40",
  },
};

function sidebarReducer(s, u) {
  return { ...s, ...u };
}

export default function Sidebar({ events, selectedEventId, onSelect, onDelete, onReorder, onNewEvent }) {
  const [{ search, collapsed, infoEvent, dragId, dragOverId }, dispatch] = useReducer(sidebarReducer, {
    search: "",
    collapsed: {},
    infoEvent: null,
    dragId: null,
    dragOverId: null,
  });

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = PLATFORMS.reduce((acc, p) => {
    acc[p] = filtered.filter((e) => e.platform === p);
    return acc;
  }, {});

  return (
    <aside className="w-64 min-w-[256px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-100 tracking-wide uppercase">
          QA Events
        </span>
        <button
          onClick={onNewEvent}
          className="flex items-center gap-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white px-2 py-1 border border-black dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 rounded-sm transition-colors"
        >
          <Plus size={12} />
          New
        </button>
      </div>

      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm px-2 py-1.5">
          <Search size={12} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => dispatch({ search: e.target.value })}
            className="bg-transparent text-xs font-mono text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {PLATFORMS.map((platform) => {
          const group = grouped[platform];
          if (group.length === 0) return null;

          const isCollapsed = collapsed[platform];
          const style = PLATFORM_STYLES[platform] ?? PLATFORM_STYLES.firebase;

          return (
            <div key={platform} className="mb-1">
              <button
                onClick={() => dispatch({ collapsed: { ...collapsed, [platform]: !collapsed[platform] } })}
                className={classnames(
                  "w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors",
                  style.header
                )}
              >
                {isCollapsed
                  ? <ChevronRight size={11} />
                  : <ChevronDown size={11} />
                }
                {platform}
                <span className={classnames("ml-auto text-[10px]", style.count)}>{group.length}</span>
              </button>

              {!isCollapsed && group.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  platform={platform}
                  style={style}
                  isSelected={event.id === selectedEventId}
                  isDragging={dragId === event.id}
                  isDragOver={dragOverId === event.id && dragId !== event.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onInfo={(e) => dispatch({ infoEvent: e })}
                  onDragStart={() => dispatch({ dragId: event.id })}
                  onDragOver={(e) => { e.preventDefault(); dispatch({ dragOverId: event.id }); }}
                  onDrop={() => { onReorder(dragId, event.id); dispatch({ dragId: null, dragOverId: null }); }}
                  onDragEnd={() => dispatch({ dragId: null, dragOverId: null })}
                />
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-4 py-6 text-xs font-mono text-zinc-400 dark:text-zinc-600 text-center">
            No events found
          </p>
        )}
      </nav>

      {infoEvent && (
        <EventInfoModal
          event={infoEvent}
          onClose={() => dispatch({ infoEvent: null })}
        />
      )}
    </aside>
  );
}

function EventRow({ event, platform, style, isSelected, isDragging, isDragOver, onSelect, onDelete, onInfo, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [hovered, setHovered] = useReducer((_, v) => v, false);

  return (
    <div
      draggable
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={classnames(
        "group flex items-center gap-2 px-4 py-2 cursor-grab active:cursor-grabbing transition-all relative select-none",
        "border-l-2",
        isSelected
          ? [style.selectedBorder, style.selectedBg, "text-zinc-900 dark:text-white"]
          : ["border-l-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60", style.hoverBorder],
        isDragging && "opacity-30",
        isDragOver && "border-t-2 border-t-sky-500"
      )}
      onClick={() => onSelect(event.id)}
    >
      <span className="flex-1 truncate text-xs font-mono">{event.name}</span>

      {hovered && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onInfo(event); }}
            className="text-zinc-400 dark:text-zinc-600 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
          >
            <Info size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
            className="text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function EventInfoModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="w-[380px] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-100 tracking-wide uppercase">
            Event Info
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-5 space-y-4">
          <InfoRow label="Event Name">
            <span className="text-sm font-mono text-zinc-800 dark:text-zinc-100">{event.name}</span>
          </InfoRow>
          <InfoRow label="Platform">
            <PlatformBadge platform={event.platform} size="md" />
          </InfoRow>
          <InfoRow label="Description">
            {event.description
              ? <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 leading-relaxed">{event.description}</p>
              : <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">No description provided.</span>
            }
          </InfoRow>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}
