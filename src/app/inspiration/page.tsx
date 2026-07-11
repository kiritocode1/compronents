import { InspirationIndex } from "@/components/site/inspiration-index";
import { inspirationGroups } from "@/lib/inspiration";

export default function InspirationPage() {
  return <InspirationIndex groups={inspirationGroups} />;
}
