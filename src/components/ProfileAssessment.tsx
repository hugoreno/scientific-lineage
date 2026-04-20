"use client";

import { useEffect, useState } from "react";
import { Scientist } from "@/lib/types";

interface ConnectionSummary {
  advisors: string[];
  students: string[];
  topCoauthors: { name: string; weight: number }[];
}

interface ProfileAssessmentProps {
  scientist: Scientist;
  connections: ConnectionSummary;
}

export default function ProfileAssessment({ scientist, connections }: ProfileAssessmentProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSummary(null);
    setError(null);

    fetch("/api/profile-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scientist, connections }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setSummary(data.summary);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load assessment");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scientist, connections]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Scientific Due-Diligence
        </h3>
        <span className="text-[10px] text-white/30">AI-generated · Gemini</span>
      </div>
      {loading && (
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-11/12" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-9/12" />
        </div>
      )}
      {!loading && error && (
        <p className="text-sm text-white/40 italic">
          AI assessment unavailable ({error}).
        </p>
      )}
      {!loading && summary && (
        <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      )}
    </div>
  );
}
