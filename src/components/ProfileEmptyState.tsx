"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scientist } from "@/lib/types";
import SearchBar from "./SearchBar";
import ViewTabs from "./ViewTabs";

interface ProfileEmptyStateProps {
  scientists: Scientist[];
}

export default function ProfileEmptyState({ scientists }: ProfileEmptyStateProps) {
  const router = useRouter();

  const featured = useMemo(() => {
    const picks = scientists
      .filter((s) => s.isNobelLaureate || s.tags.includes("prominent"))
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 8);
    return picks;
  }, [scientists]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <ViewTabs active="profile" />
          <h1 className="hidden md:block font-heading text-sm font-semibold text-white/60 tracking-wide">
            Quantum Computing Scientific Lineage
          </h1>
          <div className="min-w-[288px]">
            <SearchBar
              scientists={scientists}
              onSearch={() => undefined}
              onSelect={(s) => router.push(`/profile/${s.id}`)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold mb-3">
            Scientific Due-Diligence
          </h2>
          <p className="text-white/60 leading-relaxed">
            Search a quantum researcher to generate a one-page profile: scientific
            background, network, status signal, and an AI-written investment assessment.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-md">
            <SearchBar
              scientists={scientists}
              onSearch={() => undefined}
              onSelect={(s) => router.push(`/profile/${s.id}`)}
            />
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4 text-center">
            Start with a pioneer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {featured.map((s) => (
              <Link
                key={s.id}
                href={`/profile/${s.id}`}
                className="rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-colors p-3 text-left"
              >
                <div className="text-sm font-medium text-white truncate">{s.name}</div>
                {s.institution && (
                  <div className="text-xs text-white/50 truncate mt-0.5">
                    {s.institution}
                  </div>
                )}
                <div className="text-[10px] text-white/40 mt-1">
                  h={s.hIndex} · {s.isNobelLaureate ? "Nobel" : "Pioneer"}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-primary hover:text-primary-dark transition-colors">
            &larr; Back to graph
          </Link>
        </div>
      </div>
    </main>
  );
}
