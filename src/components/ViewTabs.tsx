"use client";

import Link from "next/link";

interface ViewTabsProps {
  active: "graph" | "profile";
  profileId?: string | null;
}

export default function ViewTabs({ active, profileId }: ViewTabsProps) {
  const profileHref = profileId ? `/profile/${profileId}` : null;

  return (
    <div className="flex items-center gap-1 bg-[#12121a]/90 backdrop-blur border border-white/10 rounded-lg p-1">
      <Link
        href="/"
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          active === "graph"
            ? "bg-white/10 text-white"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        Graph
      </Link>
      {profileHref ? (
        <Link
          href={profileHref}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            active === "profile"
              ? "bg-white/10 text-white"
              : "bg-primary/20 text-white hover:bg-primary/30 ring-1 ring-primary/40"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Profile
        </Link>
      ) : (
        <span
          className="px-3 py-1.5 text-xs font-medium rounded-md text-white/25 cursor-not-allowed"
          title="Click a scientist on the graph to enable"
        >
          Profile
        </span>
      )}
    </div>
  );
}
