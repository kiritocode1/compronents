/**
 * Shared natural-language date/time matching for search inputs across the
 * site (registry catalog, inspiration index). Understands relative phrases
 * ("today", "tomorrow", "2 days ago", "last week", "this Monday"), explicit
 * dates (ISO, numeric, month-first/day-first), and "between X and Y" ranges,
 * with typo tolerance via edit-distance correction against a fixed date
 * vocabulary.
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
  "today",
  "tomorrow",
  "yesterday",
  "day",
  "days",
  "week",
  "weeks",
  "month",
  "months",
  "ago",
  "between",
  "and",
  "to",
];

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

export function closestWord(word: string, candidates: string[]) {
  let closest = word;
  let distance = fuzzyThreshold(word) + 1;
  for (const candidate of candidates) {
    const next = editDistance(word, candidate);
    if (next < distance) {
      closest = candidate;
      distance = next;
    }
  }
  return closest;
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

function searchDateSingle(query: string, now: Date): DateMatch | null {
  const ago = query.match(/\b(\d+)\s+(days?|weeks?)\s+ago\b/);
  if (ago) {
    const amount = Number(ago[1]);
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (ago[2].startsWith("day")) {
      date.setDate(date.getDate() - amount);
      return exactDate(isoFromDate(date), ago[0]);
    }

    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) - amount * 7);
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return { start: isoFromDate(date), end: isoFromDate(end), phrase: ago[0] };
  }

  const period = query.match(/\b(this|last)\s+(week|month)\b/);
  if (period) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period[2] === "week") {
      start.setDate(
        start.getDate() -
          ((start.getDay() + 6) % 7) -
          (period[1] === "last" ? 7 : 0),
      );
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        start: isoFromDate(start),
        end: isoFromDate(end),
        phrase: period[0],
      };
    }

    const month = now.getMonth() - (period[1] === "last" ? 1 : 0);
    const monthStart = new Date(now.getFullYear(), month, 1);
    const monthEnd = new Date(now.getFullYear(), month + 1, 0);
    return {
      start: isoFromDate(monthStart),
      end: isoFromDate(monthEnd),
      phrase: period[0],
    };
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
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/,
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
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)(?:,?\s+(\d{4}))?\b/,
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

  return searchDateSingle(query, now);
}

const TIME_STOP_WORDS = [
  "added",
  "add",
  "on",
  "from",
  "in",
  "show",
  "me",
  "things",
  "stuff",
  "and",
  "to",
  "between",
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
