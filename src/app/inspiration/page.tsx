import { cookies } from "next/headers";
import { InspirationGate } from "@/components/site/inspiration-gate";
import { InspirationIndex } from "@/components/site/inspiration-index";
import { inspirationGroups } from "@/lib/inspiration";

export default async function InspirationPage() {
  const unlocked =
    (await cookies()).get("inspiration_unlock")?.value === "unlocked";

  // Links are only serialized to the client once unlocked; the gate render ships none.
  if (!unlocked) return <InspirationGate />;

  return <InspirationIndex groups={inspirationGroups} />;
}
