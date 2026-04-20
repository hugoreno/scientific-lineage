import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Scientist } from "@/lib/types";

export const runtime = "nodejs";

type ConnectionSummary = {
  advisors: string[];
  students: string[];
  topCoauthors: { name: string; weight: number }[];
};

type RequestBody = {
  scientist: Scientist;
  connections: ConnectionSummary;
};

const cache = new Map<string, { summary: string; ts: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildPrompt(scientist: Scientist, connections: ConnectionSummary): string {
  const tagList = [
    scientist.isNobelLaureate ? "Nobel Laureate" : null,
    ...scientist.tags.filter((t) => t !== "discovered"),
  ]
    .filter(Boolean)
    .join(", ");

  const companies =
    scientist.companies && scientist.companies.length > 0
      ? scientist.companies.map((c) => `${c.name} (${c.role})`).join(", ")
      : "none";

  const advisors = connections.advisors.length > 0 ? connections.advisors.join(", ") : "none listed";
  const students = connections.students.length > 0 ? connections.students.slice(0, 5).join(", ") : "none listed";
  const topCo = connections.topCoauthors.length > 0
    ? connections.topCoauthors.slice(0, 5).map((c) => c.name).join(", ")
    : "none listed";

  return `You are writing a scientific due-diligence note for a quantum-focused venture capital fund (Many Worlds Capital). Audience: investors. Voice: direct, analytical, no hype.

Produce 2-4 sentences assessing this researcher. The note MUST cover:
1. Status signal (pioneer / rising star / industry founder / emeritus) with one concrete reason.
2. Scientific contribution in one line (their actual research area, not generic).
3. Investment-relevant signal: industry ties, network centrality, momentum, or talent scarcity.

Do not list raw numbers back at the reader. Do not use the word "quantum" more than twice. No bullet points, no headers, prose only.

Researcher:
- Name: ${scientist.name}
- Institution: ${scientist.institution ?? "unknown"}${scientist.country ? " (" + scientist.country + ")" : ""}
- Tags: ${tagList || "none"}
- h-index: ${scientist.hIndex}, citations: ${scientist.citedByCount}, papers: ${scientist.worksCount}
- Known for: ${scientist.knownFor.join("; ") || "n/a"}
- Research topics: ${scientist.topTopics.slice(0, 6).join(", ") || "n/a"}
- Subfields: ${scientist.subfields?.join(", ") || "n/a"}
- Companies: ${companies}
- Advisors: ${advisors}
- Notable students: ${students}
- Top co-authors: ${topCo}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { scientist, connections } = body;

    if (!scientist?.id) {
      return NextResponse.json({ error: "Missing scientist" }, { status: 400 });
    }

    const cached = cache.get(scientist.id);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(
        { summary: cached.summary, cached: true },
        { headers: { "Cache-Control": "public, max-age=86400" } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = buildPrompt(scientist, connections);
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    cache.set(scientist.id, { summary, ts: Date.now() });

    return NextResponse.json(
      { summary, cached: false },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (err) {
    console.error("profile-summary error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
