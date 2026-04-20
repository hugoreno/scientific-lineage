import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Scientist, Relationship } from "@/lib/types";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-static";
export const revalidate = 3600;

async function loadData(): Promise<{ scientists: Scientist[]; relationships: Relationship[] }> {
  const dataDir = path.join(process.cwd(), "public", "data");
  const [scientistsRaw, relationshipsRaw] = await Promise.all([
    fs.readFile(path.join(dataDir, "scientists.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "relationships.json"), "utf-8"),
  ]);
  return {
    scientists: JSON.parse(scientistsRaw) as Scientist[],
    relationships: JSON.parse(relationshipsRaw) as Relationship[],
  };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { scientists } = await loadData();
    const s = scientists.find((x) => x.id === params.id);
    if (!s) return { title: "Profile not found" };
    return {
      title: `${s.name} — Scientific Due-Diligence`,
      description: `Scientific profile of ${s.name}${
        s.institution ? " (" + s.institution + ")" : ""
      }.`,
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { scientists, relationships } = await loadData();
  const scientist = scientists.find((s) => s.id === params.id);
  if (!scientist) notFound();

  return (
    <ProfileView scientist={scientist} scientists={scientists} relationships={relationships} />
  );
}
