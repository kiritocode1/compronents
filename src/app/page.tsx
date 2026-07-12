import { BlankIcon } from "@/components/site/blank-icon";
import { CompronentsWordmark } from "@/components/site/compronents-wordmark";
import { RegistryIndex } from "@/components/site/registry-index";
import { registryItems } from "@/lib/registry";

const items = [...registryItems].sort((a, b) => b.date.localeCompare(a.date));

export default function Page() {
  return (
    <RegistryIndex
      heading={
        <>
          A quiet registry for careful interfaces for{" "}
          <BlankIcon className="inline-block size-[0.85em] align-[-0.1em]" />{" "}
          BLANK.
        </>
      }
      items={items}
      brand={<CompronentsWordmark className="text-6xl sm:text-7xl" />}
    />
  );
}
