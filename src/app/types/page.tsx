import type { Metadata } from "next";
import Link from "next/link";
import { typeGroups, typeLessons } from "@/lib/types-viz";

export const metadata: Metadata = {
  title: "Types",
  description:
    "Interactive visualizations of the TypeScript type system, built from the Visual Types vocabulary.",
};

export default function TypesPage() {
  return (
    <main className="flex flex-col gap-14 pt-8 pb-32">
      <header className="flex flex-col gap-4">
        <h1 className="font-mono text-2xl tracking-tight">Types</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {typeLessons.length} lessons on the TypeScript type system, each one a
          set diagram you can step through. Types are sets of runtime values, so
          every lesson shows a type above the values it holds, or a type-level
          call above the type it evaluates to.
        </p>
      </header>

      <div className="flex flex-col gap-12">
        {typeGroups.map((group) => (
          <section key={group.title} className="flex flex-col gap-4">
            <h2 className="label">{group.title}</h2>
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2">
              {group.lessons.map((lesson) => (
                <li key={lesson.name}>
                  <Link
                    href={`/types/${lesson.name}`}
                    className="flex h-full flex-col gap-2 bg-background p-5 transition-colors hover:bg-card"
                  >
                    <span className="font-mono text-sm text-foreground">
                      {lesson.title}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {lesson.steps.length} steps
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
