import { promises as fs } from "fs";
import path from "path";
import { Scientist } from "@/lib/types";
import ProfileEmptyState from "@/components/ProfileEmptyState";

export const revalidate = 3600;

export const metadata = {
  title: "Scientific Due-Diligence — Many Worlds Capital",
  description: "Search a quantum researcher to generate a due-diligence profile.",
};

async function loadScientists(): Promise<Scientist[]> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "public", "data", "scientists.json"),
    "utf-8"
  );
  return JSON.parse(raw) as Scientist[];
}

export default async function ProfileIndexPage() {
  const scientists = await loadScientists();
  return <ProfileEmptyState scientists={scientists} />;
}
