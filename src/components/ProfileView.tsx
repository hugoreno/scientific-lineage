"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Scientist, Relationship } from "@/lib/types";
import { MetricCard, formatNumber } from "./MetricCard";
import ProfileAssessment from "./ProfileAssessment";
import SearchBar from "./SearchBar";
import ViewTabs from "./ViewTabs";

const TrajectoryChart = dynamic(() => import("./TrajectoryChart"), { ssr: false });

interface ProfileViewProps {
  scientist: Scientist;
  scientists: Scientist[];
  relationships: Relationship[];
}

const TAG_META: Record<string, { label: string; className: string }> = {
  prominent: { label: "Pioneer", className: "bg-primary-dark/20 text-blue-400" },
  "rising-star": { label: "Rising Star", className: "bg-accent-green/20 text-green-400" },
  founder: { label: "Industry Founder", className: "bg-purple-500/20 text-purple-400" },
  active: { label: "Active", className: "bg-white/10 text-white/70" },
  emeritus: { label: "Emeritus", className: "bg-white/10 text-white/50" },
};

function edgeEndpointId(v: Relationship["source"] | Relationship["target"]): string {
  return typeof v === "object" ? (v as Scientist).id : v;
}

export default function ProfileView({ scientist, scientists, relationships }: ProfileViewProps) {
  const router = useRouter();
  const [showAllAffiliations, setShowAllAffiliations] = useState(false);
  const [showAllCoauthors, setShowAllCoauthors] = useState(false);

  const scientistMap = useMemo(
    () => new Map(scientists.map((s) => [s.id, s])),
    [scientists]
  );

  const { advisors, students, coauthors } = useMemo(() => {
    const advisors: { scientist: Scientist; details?: string }[] = [];
    const students: { scientist: Scientist; details?: string }[] = [];
    const coauthors: {
      scientist: Scientist;
      weight: number;
      yearRange?: [number, number];
    }[] = [];

    for (const r of relationships) {
      const src = edgeEndpointId(r.source);
      const tgt = edgeEndpointId(r.target);
      if (src !== scientist.id && tgt !== scientist.id) continue;

      if (r.type === "student-of") {
        if (src === scientist.id) {
          const adv = scientistMap.get(tgt);
          if (adv) advisors.push({ scientist: adv, details: r.details });
        } else {
          const st = scientistMap.get(src);
          if (st) students.push({ scientist: st, details: r.details });
        }
      } else if (r.type === "co-authored") {
        const otherId = src === scientist.id ? tgt : src;
        const other = scientistMap.get(otherId);
        if (other) {
          coauthors.push({ scientist: other, weight: r.weight, yearRange: r.yearRange });
        }
      }
    }

    coauthors.sort((a, b) => b.weight - a.weight);
    return { advisors, students, coauthors };
  }, [relationships, scientistMap, scientist.id]);

  const assessmentConnections = useMemo(
    () => ({
      advisors: advisors.map((a) => a.scientist.name),
      students: students.map((s) => s.scientist.name),
      topCoauthors: coauthors.slice(0, 5).map((c) => ({
        name: c.scientist.name,
        weight: c.weight,
      })),
    }),
    [advisors, students, coauthors]
  );

  const affiliations = scientist.affiliationHistory;
  const visibleAffiliations = showAllAffiliations ? affiliations : affiliations.slice(0, 5);

  const visibleCoauthors = showAllCoauthors ? coauthors : coauthors.slice(0, 15);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <ViewTabs active="profile" profileId={scientist.id} />
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

      <div className="max-w-[960px] mx-auto px-6 py-8 space-y-8">
        {/* Header block */}
        <section>
          <h2 className="font-heading text-3xl font-bold">{scientist.name}</h2>
          {scientist.institution && (
            <p className="text-white/60 mt-1">
              {scientist.institution}
              {scientist.country && ` · ${scientist.country}`}
            </p>
          )}
          <div className="flex gap-2 mt-4 flex-wrap">
            {scientist.isNobelLaureate && (
              <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                Nobel Laureate
              </span>
            )}
            {scientist.tags
              .filter((t) => t !== "discovered")
              .map((t) => {
                const meta = TAG_META[t] ?? {
                  label: t,
                  className: "bg-white/10 text-white/60",
                };
                return (
                  <span
                    key={t}
                    className={`px-2.5 py-1 text-xs rounded-full font-medium ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                );
              })}
          </div>
        </section>

        {/* AI assessment */}
        <ProfileAssessment scientist={scientist} connections={assessmentConnections} />

        {/* Metrics */}
        <section>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
            Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="h-index" value={scientist.hIndex} />
            <MetricCard label="Citations" value={formatNumber(scientist.citedByCount)} />
            <MetricCard label="Papers" value={scientist.worksCount} />
            <MetricCard label="Impact score" value={scientist.impactScore.toFixed(2)} />
          </div>
        </section>

        {/* Trajectory */}
        {scientist.countsByYear && scientist.countsByYear.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              Publication Trajectory
            </h3>
            <div className="bg-white/[0.03] rounded-lg p-4 border border-white/10">
              <TrajectoryChart countsByYear={scientist.countsByYear} />
            </div>
          </section>
        )}

        {/* Known for */}
        {scientist.knownFor.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              Known for
            </h3>
            <ul className="space-y-1.5">
              {scientist.knownFor.map((item, i) => (
                <li key={i} className="text-sm text-white/85 flex items-start">
                  <span className="text-primary mr-2 mt-0.5">&#x2022;</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Research focus */}
        {(scientist.topTopics.length > 0 || (scientist.subfields?.length ?? 0) > 0) && (
          <section>
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              Research focus
            </h3>
            <div className="flex flex-wrap gap-2">
              {scientist.subfields?.map((s, i) => (
                <span
                  key={`sf-${i}`}
                  className="px-2 py-1 bg-primary-dark/20 text-blue-300 text-xs rounded"
                >
                  {s}
                </span>
              ))}
              {scientist.topTopics.map((t, i) => (
                <span key={`t-${i}`} className="px-2 py-1 bg-white/5 text-white/70 text-xs rounded">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Industry */}
        {scientist.companies && scientist.companies.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              Industry
            </h3>
            <ul className="space-y-1.5">
              {scientist.companies.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-sm bg-purple-400/60 shrink-0" />
                  <span className="text-white/85 font-medium">{c.name}</span>
                  <span className="text-white/40 text-xs">{c.role}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Connections */}
        <section className="space-y-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Connections
          </h3>

          {advisors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">Advisors</h4>
              <ul className="space-y-1.5">
                {advisors.map(({ scientist: s, details }) => (
                  <li key={s.id} className="text-sm">
                    <Link
                      href={`/profile/${s.id}`}
                      className="text-white/90 hover:text-primary transition-colors"
                    >
                      {s.name}
                    </Link>
                    {details && <span className="text-white/40 ml-2 text-xs">{details}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {students.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">
                Students ({students.length})
              </h4>
              <ul className="space-y-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {students.map(({ scientist: s, details }) => (
                  <li key={s.id} className="text-sm">
                    <Link
                      href={`/profile/${s.id}`}
                      className="text-white/90 hover:text-primary transition-colors"
                    >
                      {s.name}
                    </Link>
                    {details && <span className="text-white/40 ml-2 text-xs">{details}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {coauthors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">
                Top co-authors ({coauthors.length})
              </h4>
              <ul className="space-y-1.5">
                {visibleCoauthors.map(({ scientist: s, weight, yearRange }) => (
                  <li key={s.id} className="text-sm flex items-center gap-3">
                    <Link
                      href={`/profile/${s.id}`}
                      className="text-white/90 hover:text-primary transition-colors flex-1 truncate"
                    >
                      {s.name}
                    </Link>
                    <span className="text-white/40 text-xs shrink-0">
                      {weight} paper{weight === 1 ? "" : "s"}
                      {yearRange && ` · ${yearRange[0]}–${yearRange[1]}`}
                    </span>
                  </li>
                ))}
              </ul>
              {coauthors.length > 15 && (
                <button
                  onClick={() => setShowAllCoauthors(!showAllCoauthors)}
                  className="text-xs text-primary hover:text-primary-dark mt-2 transition-colors"
                >
                  {showAllCoauthors ? "Show less" : `Show all ${coauthors.length}`}
                </button>
              )}
            </div>
          )}

          {advisors.length === 0 && students.length === 0 && coauthors.length === 0 && (
            <p className="text-sm text-white/40">No connections in current dataset.</p>
          )}
        </section>

        {/* Affiliations */}
        {affiliations.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              Affiliations
            </h3>
            <ul className="space-y-2">
              {visibleAffiliations.map((a, i) => (
                <li key={i} className="text-sm">
                  <span className="text-white/85">{a.name}</span>
                  <span className="text-white/40 ml-2 text-xs">{a.years}</span>
                </li>
              ))}
            </ul>
            {affiliations.length > 5 && (
              <button
                onClick={() => setShowAllAffiliations(!showAllAffiliations)}
                className="text-xs text-primary hover:text-primary-dark mt-2 transition-colors"
              >
                {showAllAffiliations ? "Show less" : `Show all ${affiliations.length}`}
              </button>
            )}
          </section>
        )}

        {/* Links */}
        <section>
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
            External links
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href={`https://brain.manyworldscapital.com/papers?q=${encodeURIComponent(scientist.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
            >
              Search papers on Quantum Brain &rarr;
            </a>
            <a
              href={scientist.openAlexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              View on OpenAlex &rarr;
            </a>
            {scientist.orcid && (
              <a
                href={scientist.orcid}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                ORCID Profile &rarr;
              </a>
            )}
            <a
              href={`https://scholar.google.com/scholar?q=author:"${encodeURIComponent(scientist.name)}"`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Google Scholar &rarr;
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
