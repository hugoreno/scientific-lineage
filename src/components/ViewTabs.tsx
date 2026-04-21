"use client";

import Link from "next/link";

interface ViewTabsProps {
  active: "graph" | "profile";
  profileId?: string | null;
}

export default function ViewTabs({ active, profileId }: ViewTabsProps) {
  const profileHref = profileId ? `/profile/${profileId}` : "/profile";
  const hasSelection = Boolean(profileId);

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
      <Link
        href={profileHref}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
          active === "profile"
            ? "bg-white/10 text-white"
            : hasSelection
            ? "bg-primary/20 text-white hover:bg-primary/30 ring-1 ring-primary/40"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        {hasSelection && active !== "profile" && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        )}
        Profile
      </Link>
    </div>
  );
}
