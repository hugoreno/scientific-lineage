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
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            active === "profile"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          Profile
        </Link>
      ) : (
        <span
          className="px-3 py-1.5 text-xs font-medium rounded-md text-white/25 cursor-not-allowed"
          title="Select a scientist first"
        >
          Profile
        </span>
      )}
    </div>
  );
}
