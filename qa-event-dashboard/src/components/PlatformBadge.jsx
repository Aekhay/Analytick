"use client";

import classnames from "classnames";

const PLATFORM_CONFIG = {
  firebase: { label: "Firebase", color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30" },
  kinesis:  { label: "Kinesis",  color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30" },
  statsig:  { label: "Statsig",  color: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30" },
};

export default function PlatformBadge({ platform, size = "sm" }) {
  const config = PLATFORM_CONFIG[platform] ?? {
    label: platform,
    color: "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30",
  };

  return (
    <span
      className={classnames(
        "inline-flex items-center border font-mono font-medium rounded-sm",
        config.color,
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      )}
    >
      {config.label}
    </span>
  );
}
