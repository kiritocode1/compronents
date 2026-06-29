import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FullscreenPreview } from "@/components/site/fullscreen-preview";
import { getRegistryItem, registryItems } from "@/lib/registry";

export function generateStaticParams() {
  return registryItems.map((item) => ({ name: item.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item) return { title: "Not found" };
  return { title: `${item.title} — Fullscreen` };
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  if (!getRegistryItem(name)) notFound();
  return <FullscreenPreview name={name} />;
}
