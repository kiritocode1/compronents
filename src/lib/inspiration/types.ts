export type RetrievalMode = "search" | "recommend" | "discover";
export type Preference = "prefer" | "neutral" | "avoid";
export type Viewer = { owner: boolean };

export interface Resource {
  id: string;
  aliases: string[];
  title: string;
  href: string;
  description: string;
  categories: string[];
  dateAdded: string;
  kind: string[];
  stack: string[];
  useFor: string[];
  /** Inherited metadata is a discovery hint, never source evidence. */
  inferred: { kind: string[]; stack: string[]; useFor: string[] };
}

export interface PersonalPreference {
  resourceId: string;
  contextKey: string;
  preference: Preference;
  rating: number | null;
  note: string;
  testedAt: string | null;
  revision: number;
}

export interface Passage {
  id: string;
  resourceId: string;
  sourceUrl: string;
  heading: string;
  text: string;
  hash: string;
  fetchedAt: string;
  ordinal: number;
}

export interface RetrievalRequest {
  query: string;
  mode?: RetrievalMode;
  limit?: number;
  contextKey?: string;
  category?: string;
  kind?: string;
  stack?: string;
}

export interface RetrievalHit {
  resource: Resource;
  score: number;
  match: "exact" | "text" | "related";
  reasons: string[];
  preference?: PersonalPreference;
  evidence: Passage[];
}

export interface RetrievalResult {
  query: string;
  mode: RetrievalMode;
  hits: RetrievalHit[];
  provider: "postgres" | "hybrid" | "catalog";
  notice?: string;
}

export class InspirationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "InspirationError";
  }
}
