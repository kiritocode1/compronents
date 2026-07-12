import { RegistryIndex } from "@/components/site/registry-index";
import {
  getLibrarySection,
  getRegistryItemsBySection,
  type LibrarySectionId,
} from "@/lib/registry";
import { registryGroupsBySection } from "@/lib/registry-groups";

export function LibrarySectionPage({
  sectionId,
}: {
  sectionId: LibrarySectionId;
}) {
  const section = getLibrarySection(sectionId);
  if (!section) return null;

  return (
    <RegistryIndex
      heading={section.label}
      items={getRegistryItemsBySection(sectionId)}
      groups={registryGroupsBySection[sectionId]}
    />
  );
}
