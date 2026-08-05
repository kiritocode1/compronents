/**
 * Shared natural-language date/time matching for search inputs across the
 * site (registry catalog, inspiration index). It understands:
 *
 * - relative days: "today", "yesterday", "2 days ago", "monday", "last friday"
 * - calendar periods: "this/last week", "this/last month", "this/last year",
 *   "2 months ago" (the whole month, as "last month" means the whole month)
 * - rolling windows, which run up to today: "last 3 months", "past 2 weeks"
 * - months and years: "july", "july 2026", "2026", "in 2025"
 * - explicit dates: ISO, numeric, month-first, day-first
 * - two-sided ranges: "between X and Y", "X and Y", "X to Y"
 * - one-sided ranges: "since july", "after last week", "before 2026",
 *   "until friday", "up to friday"
 *
 * with typo tolerance via edit-distance correction against a fixed date
 * vocabulary (4+ letter words only).
 *
 * Patterns are ordered most specific first, so a day always wins over the
 * month containing it. The counterweight to all this reach is `isGuardedDate`:
 * month names and four-digit numbers are also ordinary English and version
 * numbers, and a date filter that fires on prose hides most of the results
 * with nothing on screen to explain why. So "may" and bare years read as dates
 * only when they stand alone or a cue word introduces them ("in 2025").
 */

export interface DateMatch {
  start: string | null;
  end: string | null;
  phrase: string;
}

const SEARCH_MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const SEARCH_WEEKDAYS: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

const DATE_WORDS = [
  ...Object.keys(SEARCH_MONTHS),
  ...Object.keys(SEARCH_WEEKDAYS),
  "this",
  "last",
  "past",
  "today",
  "tomorrow",
  "yesterday",
  "day",
  "days",
  "week",
  "weeks",
  "month",
  "months",
  "year",
  "years",
  "ago",
  "between",
  "and",
  "to",
];

/** Reused by every month-bearing pattern below. */
const MONTH_PATTERN =
  "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec";

/**
 * Month words that are ordinary English too. A query mentioning one of these
 * alongside other words is far more likely to be prose than a date ("things
 * that may help", "march of the icons"), so a bare one only reads as a date
 * when the query is nothing but that date. Unambiguous months ("july") are
 * free to appear mid-query.
 */
const AMBIGUOUS_MONTH_WORDS = new Set(["may", "march", "august"]);

/** Open-ended bounds, so "since july" still has two sides to compare against. */
const FAR_PAST = "0001-01-01";
const FAR_FUTURE = "9999-12-31";

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = previous;
    }
  }
  return row[right.length];
}

function fuzzyThreshold(word: string) {
  return word.length >= 8 ? 2 : word.length >= 4 ? 1 : 0;
}

/**
 * Nearest vocabulary word within a tight edit-distance budget.
 *
 * Used for date-word correction ("yestarday" → "yesterday") and for catalog
 * typo tolerance ("pixlgrid" → "pixelgrid"). Constraints matter: without them
 * a 1-edit budget turns "text" into "next" and "art" into anything nearby in
 * the description blob, which is what made the search bar feel inaccurate.
 */
export function closestWord(word: string, candidates: string[]) {
  let closest = word;
  let distance = fuzzyThreshold(word) + 1;
  const maxLenDiff = fuzzyThreshold(word) + 1;
  for (const candidate of candidates) {
    if (Math.abs(candidate.length - word.length) > maxLenDiff) continue;
    // First letter almost always survives a real typo; require it for words
    // long enough that the edit budget is non-zero.
    if (word.length >= 4 && candidate.length >= 4 && word[0] !== candidate[0]) {
      continue;
    }
    const next = editDistance(word, candidate);
    if (next < distance) {
      closest = candidate;
      distance = next;
    }
  }
  return closest;
}

/**
 * Whether a single query word hits a tokenized haystack.
 *
 * Prefer exact tokens and real prefixes over raw substring includes, so short
 * queries ("art", "text", "icon") stop matching every description that merely
 * contains those letters inside a longer word.
 */
export function matchesSearchWord(word: string, tokens: string[]): boolean {
  if (tokens.includes(word)) return true;

  // Prefix / extension for compound names:
  // - query is a prefix of a token ("pixel" → "pixelgrid") — typing a short stem
  // - token is a near-prefix of the query ("icon" → "icons") — plural / suffix
  // Do NOT let a long query match every short stem it contains ("pixelgrid"
  // must not hit every token that is just "pixel").
  if (word.length >= 3) {
    for (const token of tokens) {
      if (token.length < 3) continue;
      if (token.startsWith(word)) {
        // Shared stem of at least 3; short queries need a close-length token.
        if (word.length >= 4 || token.length <= word.length + 2) return true;
        continue;
      }
      if (
        word.startsWith(token) &&
        token.length >= 4 &&
        word.length <= token.length + 2
      ) {
        return true;
      }
    }
  }

  return closestWord(word, tokens) !== word;
}

export function fuzzyDateQuery(query: string) {
  return query.replace(/[a-z]+/g, (word) => closestWord(word, DATE_WORDS));
}

function isoDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoFromDate(date: Date) {
  return isoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function exactDate(date: string | null, phrase: string): DateMatch {
  return { start: date, end: date, phrase };
}

function spanDate(start: Date, end: Date, phrase: string): DateMatch {
  return { start: isoFromDate(start), end: isoFromDate(end), phrase };
}

/** Calendar month, first to last day. */
function monthSpan(year: number, month: number, phrase: string): DateMatch {
  return spanDate(
    new Date(year, month - 1, 1),
    new Date(year, month, 0),
    phrase,
  );
}

/**
 * Whether the query says nothing except this date and the words people wrap
 * dates in ("added", "in", "from"). Used to keep ordinary English out of the
 * date parser: "may" is a month, but "things that may help" is not a date.
 */
function isDateOnlyQuery(query: string, phrase: string) {
  return query
    .replace(phrase, " ")
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => TIME_STOP_WORDS.includes(word));
}

/** Words that announce a date, so what follows is read as one. */
const DATE_CUE_WORDS = ["in", "from", "during", "added", "on", "of"];

/**
 * Whether the phrase is introduced by a cue word. This is what lets an
 * otherwise-guarded date work mid-query: "shaders in 2025" is a date, while
 * "tailwind 2024" is a version number, and the cue is the only difference.
 */
function hasDateCue(query: string, phrase: string) {
  const index = query.indexOf(phrase);
  if (index <= 0) return false;
  const preceding = query.slice(0, index).trim().split(/\s+/).pop();
  return Boolean(preceding && DATE_CUE_WORDS.includes(preceding));
}

/** Reads as a date if it stands alone, or if a cue word introduces it. */
function isGuardedDate(query: string, phrase: string) {
  return isDateOnlyQuery(query, phrase) || hasDateCue(query, phrase);
}

function dayBefore(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day - 1);
  return isoFromDate(date);
}

function searchDateSingle(query: string, now: Date): DateMatch | null {
  const today = () =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ago = query.match(/\b(\d+)\s+(days?|weeks?|months?|years?)\s+ago\b/);
  if (ago) {
    const amount = Number(ago[1]);
    const date = today();
    if (ago[2].startsWith("day")) {
      date.setDate(date.getDate() - amount);
      return exactDate(isoFromDate(date), ago[0]);
    }

    // A month or a year ago names that whole calendar period, the way "last
    // month" does; only "N days ago" points at a single day.
    if (ago[2].startsWith("month")) {
      const month = new Date(now.getFullYear(), now.getMonth() - amount, 1);
      return monthSpan(month.getFullYear(), month.getMonth() + 1, ago[0]);
    }
    if (ago[2].startsWith("year")) {
      const year = now.getFullYear() - amount;
      return spanDate(new Date(year, 0, 1), new Date(year, 11, 31), ago[0]);
    }

    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) - amount * 7);
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return { start: isoFromDate(date), end: isoFromDate(end), phrase: ago[0] };
  }

  // Rolling window: "last 3 months", "past 2 weeks" — then until now, rather
  // than one calendar period the way "last month" means.
  const window = query.match(
    /\b(?:last|past)\s+(\d+)\s+(days?|weeks?|months?|years?)\b/,
  );
  if (window) {
    const amount = Number(window[1]);
    const start = today();
    const unit = window[2];
    if (unit.startsWith("day")) start.setDate(start.getDate() - amount);
    else if (unit.startsWith("week"))
      start.setDate(start.getDate() - amount * 7);
    else if (unit.startsWith("month")) {
      start.setMonth(start.getMonth() - amount);
    } else start.setFullYear(start.getFullYear() - amount);
    return spanDate(start, today(), window[0]);
  }

  const period = query.match(/\b(this|last)\s+(week|month|year)\b/);
  if (period) {
    const start = today();
    if (period[2] === "week") {
      start.setDate(
        start.getDate() -
          ((start.getDay() + 6) % 7) -
          (period[1] === "last" ? 7 : 0),
      );
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return spanDate(start, end, period[0]);
    }

    if (period[2] === "year") {
      const year = now.getFullYear() - (period[1] === "last" ? 1 : 0);
      return spanDate(new Date(year, 0, 1), new Date(year, 11, 31), period[0]);
    }

    const month = now.getMonth() - (period[1] === "last" ? 1 : 0);
    const shifted = new Date(now.getFullYear(), month, 1);
    return monthSpan(shifted.getFullYear(), shifted.getMonth() + 1, period[0]);
  }

  const weekday = query.match(
    /\b(this|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
  );
  if (weekday) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(
      date.getDate() -
        ((date.getDay() + 6) % 7) +
        SEARCH_WEEKDAYS[weekday[2]] -
        (weekday[1] === "last" ? 7 : 0),
    );
    return exactDate(isoFromDate(date), weekday[0]);
  }

  // Bare weekday name (no "this"/"last"): the most recent occurrence,
  // today included, e.g. asking for "Monday" on a Thursday means this
  // week's Monday; asking on a Monday means today.
  const bareWeekday = query.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
  );
  if (bareWeekday) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOffset = (date.getDay() + 6) % 7;
    const targetOffset = SEARCH_WEEKDAYS[bareWeekday[1]];
    date.setDate(date.getDate() - ((todayOffset - targetOffset + 7) % 7));
    return exactDate(isoFromDate(date), bareWeekday[0]);
  }

  const relative = query.match(
    /\b(today|tomorrow|yesterday|(?:a )?day before)\b/,
  );
  if (relative) {
    const offset =
      relative[1] === "today" ? 0 : relative[1] === "tomorrow" ? 1 : -1;
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    );
    return exactDate(isoFromDate(date), relative[0]);
  }

  const iso = query.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso)
    return exactDate(
      isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3])),
      iso[0],
    );

  const numeric = query.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const rawYear = numeric[3];
    const year = rawYear
      ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear)
      : now.getFullYear();
    return exactDate(
      isoDate(year, Number(numeric[1]), Number(numeric[2])),
      numeric[0],
    );
  }

  const monthFirst = query.match(
    new RegExp(
      `\\b(${MONTH_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`,
    ),
  );
  if (monthFirst)
    return exactDate(
      isoDate(
        Number(monthFirst[3] ?? now.getFullYear()),
        SEARCH_MONTHS[monthFirst[1]],
        Number(monthFirst[2]),
      ),
      monthFirst[0],
    );

  const dayFirst = query.match(
    new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_PATTERN})(?:,?\\s+(\\d{4}))?\\b`,
    ),
  );
  if (dayFirst)
    return exactDate(
      isoDate(
        Number(dayFirst[3] ?? now.getFullYear()),
        SEARCH_MONTHS[dayFirst[2]],
        Number(dayFirst[1]),
      ),
      dayFirst[0],
    );

  // "july 2026": the whole month. Must come after both day-bearing patterns,
  // or it eats the "july 2026" inside "19 july 2026" and loses the day.
  const monthYear = query.match(
    new RegExp(`\\b(${MONTH_PATTERN})\\s+(?:of\\s+)?(\\d{4})\\b`),
  );
  if (monthYear) {
    return monthSpan(
      Number(monthYear[2]),
      SEARCH_MONTHS[monthYear[1]],
      monthYear[0],
    );
  }

  // Bare "july": that month of the current year. Months that double as English
  // words need the query to be nothing but the date, so prose is left alone.
  const bareMonth = query.match(new RegExp(`\\b(${MONTH_PATTERN})\\b`));
  if (
    bareMonth &&
    (!AMBIGUOUS_MONTH_WORDS.has(bareMonth[1]) ||
      isGuardedDate(query, bareMonth[0]))
  ) {
    return monthSpan(
      now.getFullYear(),
      SEARCH_MONTHS[bareMonth[1]],
      bareMonth[0],
    );
  }

  // Bare "2026": that whole year. Always guarded, since a four-digit number
  // next to other words is usually a version or part of a name.
  const bareYear = query.match(/\b(20\d{2})\b/);
  if (bareYear && isGuardedDate(query, bareYear[0])) {
    const year = Number(bareYear[1]);
    return spanDate(new Date(year, 0, 1), new Date(year, 11, 31), bareYear[0]);
  }

  return null;
}

function combineRange(a: DateMatch, b: DateMatch, phrase: string): DateMatch {
  const bounds: string[] = [
    a.start as string,
    (a.end ?? a.start) as string,
    b.start as string,
    (b.end ?? b.start) as string,
  ];
  return {
    start: bounds.reduce((min, d) => (d < min ? d : min)),
    end: bounds.reduce((max, d) => (d > max ? d : max)),
    phrase,
  };
}

/** Tries every occurrence of `connector` as a range split point ("X <connector> Y"). */
function tryRangeSplit(
  query: string,
  connector: string,
  now: Date,
): DateMatch | null {
  let searchFrom = 0;
  for (;;) {
    const idx = query.indexOf(connector, searchFrom);
    if (idx === -1) return null;

    const left = query.slice(0, idx);
    const right = query.slice(idx + connector.length);
    const a = searchDateSingle(left, now);
    const b = searchDateSingle(right, now);
    if (a?.start && b?.start) {
      const aStart = left.lastIndexOf(a.phrase);
      const bEnd = right.indexOf(b.phrase) + b.phrase.length;
      const phrase = left.slice(aStart) + connector + right.slice(0, bEnd);
      return combineRange(a, b, phrase);
    }
    searchFrom = idx + 1;
  }
}

/**
 * Parses a single date/time phrase, or a two-sided range: "between X and Y",
 * "X and Y", or "X to Y" (each side independently resolved as a date phrase).
 */
export function searchDate(query: string, now: Date): DateMatch | null {
  const between = query.match(/\bbetween\s+(.+?)\s+and\s+(.+)$/);
  if (between) {
    const a = searchDateSingle(between[1].trim(), now);
    const b = searchDateSingle(between[2].trim(), now);
    if (a?.start && b?.start) return combineRange(a, b, between[0]);
  }

  const bareRange =
    tryRangeSplit(query, " and ", now) ?? tryRangeSplit(query, " to ", now);
  if (bareRange) return bareRange;

  const openEnded = openEndedRange(query, now);
  if (openEnded) return openEnded;

  return searchDateSingle(query, now);
}

/**
 * One-sided ranges: "since july", "after last week", "before 2026", "up to
 * friday". The bound that is not given becomes a sentinel, because
 * matchesDateRange needs two sides to compare.
 *
 * "before" is exclusive and "until"/"up to" are inclusive, which is how people
 * read them: "before 2026" must not return anything from 2026, while "up to
 * friday" includes friday itself.
 */
function openEndedRange(query: string, now: Date): DateMatch | null {
  const open = query.match(/\b(since|after|before|until|up to)\s+(.+)$/);
  if (!open) return null;

  const target = searchDateSingle(open[2], now);
  if (!target?.start) return null;

  // Slice the real matched text rather than rebuilding it, so the phrase can
  // be removed from the query verbatim.
  const consumed = open[2].indexOf(target.phrase) + target.phrase.length;
  const phrase = open[0].slice(0, open[0].length - (open[2].length - consumed));

  if (open[1] === "since" || open[1] === "after") {
    return { start: target.start, end: FAR_FUTURE, phrase };
  }
  const end =
    open[1] === "before"
      ? dayBefore(target.start)
      : (target.end ?? target.start);
  return { start: FAR_PAST, end, phrase };
}

const TIME_STOP_WORDS = [
  "added",
  "add",
  "on",
  "from",
  "in",
  "during",
  "of",
  "show",
  "me",
  "things",
  "stuff",
  "and",
  "to",
  "between",
  "since",
  "after",
  "before",
  "until",
  "up",
];

/**
 * Splits a raw search query into a parsed date/range (if any, with typo
 * tolerance) and the remaining significant words for plain text matching.
 */
export function parseTimeQuery(rawQuery: string, now = new Date()) {
  const query = rawQuery.trim().toLowerCase().replace(/\s+/g, " ");
  if (!query)
    return { query, date: null as DateMatch | null, words: [] as string[] };

  const fuzzyQuery = fuzzyDateQuery(query);
  const date = searchDate(query, now) ?? searchDate(fuzzyQuery, now);
  const words = (date ? fuzzyQuery.replace(date.phrase, " ") : query)
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !date || !TIME_STOP_WORDS.includes(word));

  return { query, date, words };
}

/** Whether an ISO `YYYY-MM-DD` date falls inside a parsed range (or no range at all). */
export function matchesDateRange(date: string, range: DateMatch | null) {
  if (!range) return true;
  if (!range.start || !range.end) return false;
  return date >= range.start && date <= range.end;
}
