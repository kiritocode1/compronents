import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TypesViz } from "@/components/site/types-viz";
import { highlight } from "@/lib/shiki";
import { getTypeLesson, lessonDefinitions, typeLessons } from "@/lib/types-viz";

export function generateStaticParams() {
  return typeLessons.map((lesson) => ({ name: lesson.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const lesson = getTypeLesson(name);
  if (!lesson) return { title: "Not found" };
  // the explainer is markdown-ish; strip the two markers for the meta tag
  const description = lesson.explainer.replace(/[`*]/g, "");
  return { title: lesson.title, description };
}

export default async function TypeLessonPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const lesson = getTypeLesson(name);
  if (!lesson) notFound();

  const index = typeLessons.findIndex((entry) => entry.name === lesson.name);
  const previous = typeLessons[index - 1];
  const next = typeLessons[index + 1];

  // every snippet the lesson can show, highlighted once up front
  const definitionHtml = Object.fromEntries(
    await Promise.all(
      lessonDefinitions(lesson).map(
        async (code) => [code, await highlight(code, "ts")] as const,
      ),
    ),
  );

  return (
    <main className="flex flex-col gap-10 pt-8 pb-32">
      <header className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.12em]">
          <Link
            href="/types"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Types
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{lesson.group}</span>
        </nav>
        <h1 className="font-mono text-2xl tracking-tight">{lesson.title}</h1>
      </header>

      <TypesViz lesson={lesson} definitionHtml={definitionHtml} />

      <nav className="flex items-center justify-between gap-4 text-sm">
        {previous ? (
          <Link
            href={`/types/${previous.name}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/types/${next.name}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {next.title} →
          </Link>
        )}
      </nav>
    </main>
  );
}
