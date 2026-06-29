"use client";

import { DemoStage } from "@/components/site/demo-stage";
import { studios } from "@/components/studios";

export function ComponentStudioPanel({ name }: { name: string }) {
  const Studio = studios[name];

  if (!Studio) {
    return <DemoStage name={name} />;
  }

  return <Studio />;
}
