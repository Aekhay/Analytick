"use client";

import classnames from "classnames";

const PLATFORM_CONFIG = {
  firebase: { label: "Firebase", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  kinesis: { label: "Kinesis", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  statsig: { label: "Statsig", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

export default function PlatformBadge({ platform, size = "sm" }) {
  const config = PLATFORM_CONFIG[platform] ?? {
    label: platform,
    color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
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
