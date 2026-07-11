import { RegistryIndex } from "@/components/site/registry-index";
import { registryItems } from "@/lib/registry";

const items = [...registryItems].sort((a, b) => b.date.localeCompare(a.date));

export default function Page() {
  return (
    <RegistryIndex
      heading="A Quiet Registry for Careful Interfaces."
      items={items}
    />
  );
}
