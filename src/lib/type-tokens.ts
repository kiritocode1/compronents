/**
 * TypeScript type-expression tokenizer for the Visual Types engine.
 *
 * A 1:1 port of the segmenter behind types.kitlangton.com. The point is not
 * syntax highlighting (shiki already does that); it is producing **stable
 * segment ids** so that when one step's type morphs into the next, tokens that
 * survive keep their identity and animate in place, while tokens that appear or
 * disappear blur and collapse. Every id is derived from the token's structural
 * role plus an occurrence counter, never from its array index, so inserting a
 * union member does not renumber everything after it.
 *
 * Mechanics reference: docs/types-visualization-guide.md
 */

export interface TypeSegment {
  id: string;
  content: string;
  color: string;
  isEllipsis?: boolean;
}

export interface TokenTheme {
  typeKeyword: string;
  typeName: string;
  typeLiteral: string;
  parameterName: string;
  operator: string;
  punctuation: string;
  valueString: string;
  valueNumber: string;
  valueBoolean: string;
  valueKeyword: string;
  valueConstructor: string;
  valuePunctuation: string;
  /** line and block comments; only reached when segmenting real code */
  comment: string;
}

/** kit ships six; github-dark is the one the site actually renders */
export const TOKEN_THEMES = {
  "github-dark": {
    typeKeyword: "#F97583",
    typeName: "#B392F0",
    typeLiteral: "#79B8FF",
    parameterName: "#FFAB70",
    operator: "#F97583",
    punctuation: "#E1E4E8",
    valueString: "#A5D6FF",
    valueNumber: "#79B8FF",
    valueBoolean: "#79B8FF",
    valueKeyword: "#FF7B72",
    valueConstructor: "#79C0FF",
    valuePunctuation: "#E1E4E8",
    comment: "#6A737D",
  },
  "github-light": {
    typeKeyword: "#CF222E",
    typeName: "#8250DF",
    typeLiteral: "#0550AE",
    parameterName: "#953800",
    operator: "#CF222E",
    punctuation: "#24292F",
    valueString: "#0A3069",
    valueNumber: "#0550AE",
    valueBoolean: "#0550AE",
    valueKeyword: "#CF222E",
    valueConstructor: "#6639BA",
    valuePunctuation: "#24292F",
    comment: "#6A737D",
  },
} satisfies Record<string, TokenTheme>;

export type ThemeName = keyof typeof TOKEN_THEMES;

// ---------------------------------------------------------------------------
// lexer
// ---------------------------------------------------------------------------

type RawKind =
  | "whitespace"
  | "string"
  | "number"
  | "identifier"
  | "punctuation"
  | "operator"
  | "comment";

interface RawToken {
  kind: RawKind;
  value: string;
}

/** multi-character operators, matched longest-first by declaration order */
const MULTI_OPS = [
  "=>",
  "...",
  "&&",
  "||",
  "??",
  "===",
  "!==",
  "==",
  "!=",
  "<=",
  ">=",
  "?.",
];

const PUNCT = new Set([
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ",",
  ";",
  "<",
  ">",
  ".",
  "@",
  ":",
]);
const OPERATORS = new Set([
  "|",
  "&",
  "+",
  "-",
  "*",
  "/",
  "%",
  "^",
  "!",
  "~",
  "=",
]);

const PRIMITIVES = new Set([
  "any",
  "boolean",
  "bigint",
  "never",
  "null",
  "number",
  "object",
  "string",
  "symbol",
  "true",
  "false",
  "undefined",
  "unknown",
  "void",
]);

const KEYWORDS = new Set([
  "asserts",
  "extends",
  "infer",
  "in",
  "is",
  "keyof",
  "readonly",
  "satisfies",
  "typeof",
  "unique",
  "new",
  "as",
]);

/** a space is never emitted directly after these */
const NO_SPACE_AFTER = new Set([
  "{",
  "(",
  "[",
  ",",
  ";",
  ".",
  "?",
  ":",
  "=",
  "|",
  "&",
  "=>",
]);
/**
 * ...nor directly before these.
 *
 * `=` is in this set but not in kit's. Every operator that emits its own
 * surrounding spaces (`|`, `&`, `=>`) is listed so the source whitespace does
 * not double up; `=` emits ` = ` the same way but was left out, which renders
 * `K = "x"` as `K  = "x"`. The conditional `?` escapes the same bug only
 * because its own leading space is a duplicate blank that `emit` drops.
 */
const NO_SPACE_BEFORE = new Set([
  "}",
  ")",
  "]",
  ",",
  ";",
  ".",
  ":",
  "|",
  "&",
  "=>",
  "=",
]);

const isSpace = (c: string) =>
  c === " " || c === "\t" || c === "\n" || c === "\r";
const isDigit = (c: string) => c >= "0" && c <= "9";
const isIdentStart = (c: string) => /[A-Za-z_$]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_$]/.test(c);

function lex(input: string): RawToken[] {
  const out: RawToken[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i] as string;

    if (isSpace(c)) {
      let run = "";
      while (i < input.length && isSpace(input[i] as string)) {
        run += input[i];
        i += 1;
      }
      out.push({ kind: "whitespace", value: run });
      continue;
    }

    // comments first: `//` would otherwise lex as two divide operators
    if (input.startsWith("//", i)) {
      const end = input.indexOf("\n", i);
      const stop = end === -1 ? input.length : end;
      out.push({ kind: "comment", value: input.slice(i, stop) });
      i = stop;
      continue;
    }
    if (input.startsWith("/*", i)) {
      const end = input.indexOf("*/", i + 2);
      const stop = end === -1 ? input.length : end + 2;
      out.push({ kind: "comment", value: input.slice(i, stop) });
      i = stop;
      continue;
    }

    const multi = MULTI_OPS.find((op) => input.startsWith(op, i));
    if (multi) {
      out.push({ kind: "operator", value: multi });
      i += multi.length;
      continue;
    }

    if (c === "'" || c === '"' || c === "`") {
      const quote = c;
      let str = c;
      i += 1;
      while (i < input.length) {
        const ch = input[i] as string;
        str += ch;
        if (ch === "\\" && i + 1 < input.length) {
          str += input[i + 1];
          i += 2;
          continue;
        }
        i += 1;
        if (ch === quote) break;
      }
      out.push({ kind: "string", value: str });
      continue;
    }

    if (isDigit(c)) {
      let num = c;
      i += 1;
      while (i < input.length) {
        const ch = input[i] as string;
        if (!isDigit(ch) && ch !== "_" && ch !== ".") break;
        num += ch;
        i += 1;
      }
      out.push({ kind: "number", value: num });
      continue;
    }

    if (isIdentStart(c)) {
      let ident = c;
      i += 1;
      while (i < input.length && isIdentPart(input[i] as string)) {
        ident += input[i];
        i += 1;
      }
      out.push({ kind: "identifier", value: ident });
      continue;
    }

    out.push({
      kind: PUNCT.has(c)
        ? "punctuation"
        : OPERATORS.has(c)
          ? "operator"
          : "identifier",
      value: c,
    });
    i += 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// classification
// ---------------------------------------------------------------------------

type TokenClass =
  | "comment"
  | "keyword"
  | "primitive"
  | "parameter"
  | "operator"
  | "punctuation"
  | "ellipsis"
  | "string"
  | "number"
  | "identifier";

/** index of the next non-whitespace token at or after `from`, or -1 */
function nextIndex(tokens: RawToken[], from: number): number {
  for (let i = from; i < tokens.length; i += 1) {
    if (tokens[i]?.kind !== "whitespace") return i;
  }
  return -1;
}

/** index of the previous non-whitespace token at or before `from`, or -1 */
function prevIndex(tokens: RawToken[], from: number): number {
  for (let i = from; i >= 0; i -= 1) {
    if (tokens[i]?.kind !== "whitespace") return i;
  }
  return -1;
}

/**
 * An identifier is a *parameter name* (orange) rather than a type name when it
 * sits in the key position of an object type or a function's argument list:
 * `{ name: string }`, `(x: number) => void`, `(...args: any)`, `[K in keyof T]`.
 */
function isParameterPosition(
  tokens: RawToken[],
  at: number,
  brackets: string[],
): boolean {
  const enclosing = brackets.at(-1);
  if (!enclosing) return false;

  const nextAt = nextIndex(tokens, at + 1);
  if (nextAt === -1) return false;
  const next = tokens[nextAt] as RawToken;

  if (enclosing === "brace" || enclosing === "paren") {
    if (next.value === ":") return true;
    // optional property: `name?: string`
    if (next.value === "?") {
      const after = nextIndex(tokens, nextAt + 1);
      if (after !== -1 && tokens[after]?.value === ":") return true;
    }
  }
  if (enclosing === "paren") {
    const before = prevIndex(tokens, at - 1);
    if (before !== -1 && tokens[before]?.value === "...") return true;
  }
  return enclosing === "bracket" && next.value === "in";
}

function classify(
  token: RawToken,
  tokens: RawToken[],
  at: number,
  brackets: string[],
): TokenClass {
  if (token.kind === "comment") return "comment";
  if (token.kind === "string") return "string";
  if (token.kind === "number") return "number";
  if (token.kind === "operator")
    return token.value === "..." ? "ellipsis" : "operator";
  if (token.kind === "punctuation") return "punctuation";
  if (token.kind === "identifier") {
    const lower = token.value.toLowerCase();
    if (PRIMITIVES.has(lower)) return "primitive";
    if (KEYWORDS.has(lower)) return "keyword";
    if (isParameterPosition(tokens, at, brackets)) return "parameter";
  }
  return "identifier";
}

function colorFor(cls: TokenClass, theme: TokenTheme): string {
  switch (cls) {
    case "comment":
      return theme.comment;
    case "keyword":
      return theme.typeKeyword;
    case "primitive":
    case "string":
    case "number":
      return theme.typeLiteral;
    case "parameter":
      return theme.parameterName;
    case "operator":
      return theme.operator;
    case "punctuation":
    case "ellipsis":
      return theme.punctuation;
    default:
      return theme.typeName;
  }
}

// ---------------------------------------------------------------------------
// segment emission
// ---------------------------------------------------------------------------

/** djb-ish rolling hash, base36. Keeps ids short and content-derived. */
export function hashContent(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/** per-role occurrence counter, so the second `{` is `brace-open-1` */
function bump(counts: Map<string, number>, role: string): number {
  const n = counts.get(role) ?? 0;
  counts.set(role, n + 1);
  return n;
}

function emit(
  out: TypeSegment[],
  prefix: string,
  role: string,
  content: string,
  color: string,
  opts: { isEllipsis?: boolean } = {},
): void {
  if (!content) return;
  // never emit two identical spaces back to back
  const last = out.at(-1);
  if (
    last &&
    last.content === content &&
    last.color === color &&
    content.trim() === "" &&
    !content.includes("\n")
  ) {
    return;
  }
  const seg: TypeSegment = {
    id: `${prefix}-${role}-${hashContent(content)}`,
    content,
    color,
  };
  if (opts.isEllipsis) seg.isEllipsis = true;
  out.push(seg);
}

/** true when the last emitted segment is blank, so we do not double-space */
function endsWithSpace(out: TypeSegment[]): boolean {
  const last = out.at(-1);
  return last ? last.content.trim() === "" : false;
}

function popIfTop(stack: string[], kind: string): void {
  if (stack.at(-1) === kind) stack.pop();
}

/** the whitespace run at `at` collapses to at most one space, or a newline */
function emitWhitespace(
  out: TypeSegment[],
  tokens: RawToken[],
  at: number,
  theme: TokenTheme,
  prefix: string,
  counts: Map<string, number>,
): void {
  const token = tokens[at] as RawToken;
  if (token.value.includes("\n")) {
    emit(
      out,
      prefix,
      `newline-${bump(counts, "newline")}`,
      token.value.replace(/\r/g, ""),
      theme.punctuation,
    );
    return;
  }
  const before = prevIndex(tokens, at - 1);
  const after = nextIndex(tokens, at + 1);
  if (before === -1 || after === -1) return;
  if (NO_SPACE_AFTER.has((tokens[before] as RawToken).value)) return;
  if (NO_SPACE_BEFORE.has((tokens[after] as RawToken).value)) return;
  emit(out, prefix, `space-${bump(counts, "space")}`, " ", theme.punctuation);
}

/** skip inline whitespace, stopping at a newline; returns the next index */
function skipInlineSpace(tokens: RawToken[], from: number): number {
  let i = from;
  while (i < tokens.length) {
    const t = tokens[i] as RawToken;
    if (t.kind === "whitespace" && !t.value.includes("\n")) {
      i += 1;
      continue;
    }
    break;
  }
  return i;
}

/** is everything between `at` and the previous token just a newline? */
function afterNewline(tokens: RawToken[], at: number): boolean {
  for (let i = at - 1; i >= 0; i -= 1) {
    const t = tokens[i] as RawToken;
    if (t.kind !== "whitespace") return false;
    if (t.value.includes("\n")) return true;
  }
  return false;
}

/** is everything from `at` forward whitespace ending in a newline? */
function beforeNewline(tokens: RawToken[], at: number): boolean {
  for (let i = at; i < tokens.length; i += 1) {
    const t = tokens[i] as RawToken;
    if (t.kind !== "whitespace") return false;
    if (t.value.includes("\n")) return true;
  }
  return false;
}

/** `T[]` is an array suffix, not an index; `Foo[K]` is an index */
function isArraySuffix(tokens: RawToken[], at: number): boolean {
  const next = tokens[skipInlineSpace(tokens, at + 1)];
  const beforeAt = prevIndex(tokens, at - 1);
  const before = beforeAt === -1 ? undefined : tokens[beforeAt];
  return Boolean(before && next && next.value === "]" && before.value !== "[");
}

/**
 * Pops the conditional-`?` recorded at the same bracket depth, if any. This is
 * what tells `T extends U ? X : Y`'s colon (an operator, spaced) apart from
 * `{ a: string }`'s colon (punctuation, tight).
 */
function popConditionalAtDepth(
  pending: { depth: number }[],
  depth: number,
): boolean {
  for (let i = pending.length - 1; i >= 0; i -= 1) {
    if (pending[i]?.depth === depth) {
      pending.splice(i, 1);
      return true;
    }
  }
  return false;
}

/**
 * Turn a TypeScript type expression into coloured segments with stable ids.
 * `prefix` namespaces the ids so two stacks on the same screen never collide.
 */
export function segmentType(
  source: string,
  theme: TokenTheme,
  prefix = "return",
): TypeSegment[] {
  const trimmed = source.trim();
  if (!trimmed) return [];

  const tokens = lex(trimmed);
  const out: TypeSegment[] = [];
  const brackets: string[] = [];
  const pendingConditionals: { depth: number }[] = [];
  const counts = new Map<string, number>();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as RawToken;

    if (token.kind === "whitespace") {
      emitWhitespace(out, tokens, i, theme, prefix, counts);
      continue;
    }

    if (token.value === "{") {
      const n = bump(counts, "brace-open");
      emit(out, prefix, `brace-open-${n}`, "{", theme.punctuation);
      brackets.push("brace");
      // `{ a: 1 }` gets inner padding, `{}` does not
      const nextAt = skipInlineSpace(tokens, i + 1);
      const next = tokens[nextAt];
      if (
        next &&
        next.kind !== "whitespace" &&
        !(next.kind === "punctuation" && next.value === "}")
      ) {
        emit(out, prefix, `space-after-brace-${n}`, " ", theme.punctuation);
      }
      i = nextAt - 1;
      continue;
    }

    if (token.value === "}") {
      const n = bump(counts, "brace-close");
      if (!afterNewline(tokens, i) && !endsWithSpace(out)) {
        emit(out, prefix, `space-before-brace-${n}`, " ", theme.punctuation);
      }
      emit(out, prefix, `brace-close-${n}`, "}", theme.punctuation);
      popIfTop(brackets, "brace");
      continue;
    }

    if (token.value === "[") {
      if (isArraySuffix(tokens, i)) {
        const end = skipInlineSpace(tokens, i + 1);
        emit(
          out,
          prefix,
          `array-suffix-${bump(counts, "array-suffix")}`,
          "[]",
          theme.typeName,
        );
        i = end;
        continue;
      }
      emit(
        out,
        prefix,
        `bracket-open-${bump(counts, "bracket-open")}`,
        "[",
        theme.punctuation,
      );
      brackets.push("bracket");
      continue;
    }

    if (token.value === "]") {
      emit(
        out,
        prefix,
        `bracket-close-${bump(counts, "bracket-close")}`,
        "]",
        theme.punctuation,
      );
      popIfTop(brackets, "bracket");
      continue;
    }

    if (token.value === "(") {
      emit(
        out,
        prefix,
        `paren-open-${bump(counts, "paren-open")}`,
        "(",
        theme.punctuation,
      );
      brackets.push("paren");
      continue;
    }

    if (token.value === ")") {
      emit(
        out,
        prefix,
        `paren-close-${bump(counts, "paren-close")}`,
        ")",
        theme.punctuation,
      );
      popIfTop(brackets, "paren");
      continue;
    }

    if (token.value === ",") {
      const n = bump(counts, "comma");
      const nextAt = skipInlineSpace(tokens, i + 1);
      const next = tokens[nextAt];
      const wraps = next?.kind === "whitespace" && next.value.includes("\n");
      emit(out, prefix, `comma-${n}`, wraps ? "," : ", ", theme.punctuation);
      i = nextAt - 1;
      continue;
    }

    if (token.value === ";") {
      const n = bump(counts, "semicolon");
      emit(out, prefix, `semicolon-${n}`, ";", theme.punctuation);
      const nextAt = skipInlineSpace(tokens, i + 1);
      const next = tokens[nextAt];
      const closingBrace = next?.kind === "punctuation" && next.value === "}";
      if (!closingBrace && !beforeNewline(tokens, i + 1)) {
        emit(out, prefix, `space-after-semicolon-${n}`, " ", theme.punctuation);
      }
      i = nextAt - 1;
      continue;
    }

    if (token.value === ":") {
      if (popConditionalAtDepth(pendingConditionals, brackets.length)) {
        const n = bump(counts, "conditional-colon");
        emit(
          out,
          prefix,
          `space-before-conditional-colon-${n}`,
          " ",
          theme.punctuation,
        );
        emit(out, prefix, `conditional-colon-${n}`, ":", theme.operator);
        emit(
          out,
          prefix,
          `space-after-conditional-colon-${n}`,
          " ",
          theme.punctuation,
        );
      } else {
        emit(
          out,
          prefix,
          `colon-${bump(counts, "colon")}`,
          ": ",
          theme.operator,
        );
      }
      i = skipInlineSpace(tokens, i + 1) - 1;
      continue;
    }

    if (token.value === "|" || token.value === "&" || token.value === "=") {
      const role =
        token.value === "|"
          ? "union"
          : token.value === "&"
            ? "intersection"
            : "equals";
      emit(
        out,
        prefix,
        `${role}-${bump(counts, role)}`,
        ` ${token.value} `,
        theme.operator,
      );
      i = skipInlineSpace(tokens, i + 1) - 1;
      continue;
    }

    if (token.value === "=>") {
      const n = bump(counts, "arrow");
      if (!endsWithSpace(out)) {
        emit(out, prefix, `space-before-arrow-${n}`, " ", theme.punctuation);
      }
      emit(out, prefix, `arrow-${n}`, "=>", theme.operator);
      emit(out, prefix, `space-after-arrow-${n}`, " ", theme.punctuation);
      i = skipInlineSpace(tokens, i + 1) - 1;
      continue;
    }

    if (token.value === "..." || token.value === "…") {
      emit(
        out,
        prefix,
        `ellipsis-${bump(counts, "ellipsis")}`,
        "…",
        theme.punctuation,
        { isEllipsis: true },
      );
      continue;
    }

    if (token.value === "?") {
      const nextAt = skipInlineSpace(tokens, i + 1);
      if (tokens[nextAt]?.value === ":") {
        // optional property marker: `name?: string`
        emit(
          out,
          prefix,
          `optional-${bump(counts, "optional")}`,
          "?",
          theme.punctuation,
        );
      } else {
        const n = bump(counts, "conditional-question");
        emit(
          out,
          prefix,
          `space-before-conditional-question-${n}`,
          " ",
          theme.punctuation,
        );
        emit(out, prefix, `conditional-question-${n}`, "?", theme.operator);
        emit(
          out,
          prefix,
          `space-after-conditional-question-${n}`,
          " ",
          theme.punctuation,
        );
        pendingConditionals.push({ depth: brackets.length });
      }
      i = nextAt - 1;
      continue;
    }

    if (token.kind === "comment") {
      emit(
        out,
        prefix,
        `comment-${bump(counts, "comment")}`,
        token.value,
        theme.comment,
      );
      continue;
    }

    const cls = classify(token, tokens, i, brackets);
    const role = `${cls}-${token.value}`;
    emit(
      out,
      prefix,
      `${role}-${bump(counts, role)}`,
      token.value,
      colorFor(cls, theme),
    );
  }

  return out;
}

// ---------------------------------------------------------------------------
// value sets  ->  { true, false }
// ---------------------------------------------------------------------------

/** a member of a rendered value set; arrays render as tuples */
export type SetValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[];

function pushScalar(
  out: TypeSegment[],
  prefix: string,
  role: string,
  value: string | number | boolean,
  theme: TokenTheme,
): void {
  if (typeof value === "string") {
    out.push({
      id: `${prefix}-${role}-${hashContent(value)}`,
      content: `"${value}"`,
      color: theme.valueString,
    });
    return;
  }
  out.push({
    id: `${prefix}-${role}-${value}`,
    content: String(value),
    color: typeof value === "number" ? theme.valueNumber : theme.valueBoolean,
  });
}

/** literal strings that render bare rather than quoted */
const BARE_VALUES = new Set(["Infinity", "-Infinity", "undefined", "null"]);
const BARE_ROLE: Record<string, string> = {
  Infinity: "inf",
  "-Infinity": "neginf",
  undefined: "undef",
  null: "null",
};

export function segmentValueSet(
  values: SetValue[],
  theme: TokenTheme,
  prefix = "value-set",
): TypeSegment[] {
  const out: TypeSegment[] = [];
  out.push({
    id: `${prefix}-brace-open`,
    content: "{",
    color: theme.valuePunctuation,
  });
  out.push({
    id: `${prefix}-space-open`,
    content: " ",
    color: theme.valuePunctuation,
  });

  values.forEach((value, index) => {
    if (Array.isArray(value)) {
      out.push({
        id: `${prefix}-val-${index}-array-open`,
        content: "[",
        color: theme.valuePunctuation,
      });
      value.forEach((element, elementIndex) => {
        pushScalar(
          out,
          prefix,
          `val-${index}-elem-${elementIndex}`,
          element,
          theme,
        );
        if (elementIndex < value.length - 1) {
          out.push({
            id: `${prefix}-val-${index}-elem-comma-${elementIndex}`,
            content: ", ",
            color: theme.valuePunctuation,
          });
        }
      });
      out.push({
        id: `${prefix}-val-${index}-array-close`,
        content: "]",
        color: theme.valuePunctuation,
      });
    } else if (typeof value === "string" && value === "...") {
      out.push({
        id: `${prefix}-val-${index}-ellipsis`,
        content: "...",
        color: theme.valuePunctuation,
      });
    } else if (typeof value === "string" && BARE_VALUES.has(value)) {
      out.push({
        id: `${prefix}-val-${index}-${BARE_ROLE[value]}`,
        content: value,
        color: theme.valueKeyword,
      });
    } else {
      pushScalar(out, prefix, `val-${index}`, value, theme);
    }

    if (index < values.length - 1) {
      out.push({
        id: `${prefix}-comma-${index}`,
        content: ", ",
        color: theme.valuePunctuation,
      });
    }
  });

  out.push({
    id: `${prefix}-space-close`,
    content: " ",
    color: theme.valuePunctuation,
  });
  out.push({
    id: `${prefix}-brace-close`,
    content: "}",
    color: theme.valuePunctuation,
  });
  return out;
}

// ---------------------------------------------------------------------------
// type nodes: the small algebra lesson specs are written in
// ---------------------------------------------------------------------------

export type TypeNode =
  | { kind: "raw"; value: string }
  | { kind: "functionSignature"; value: string }
  | { kind: "segments"; value: TypeSegment[] }
  | { kind: "literal"; value: unknown }
  | { kind: "union"; value: unknown[] }
  | { kind: "valueSet"; value: SetValue[] }
  | { kind: "typeRef"; value: string };

export const t = {
  raw: (value: string): TypeNode => ({ kind: "raw", value }),
  functionSignature: (value: string): TypeNode => ({
    kind: "functionSignature",
    value,
  }),
  segments: (value: TypeSegment[]): TypeNode => ({ kind: "segments", value }),
  literal: (value: unknown): TypeNode => ({ kind: "literal", value }),
  union: (value: unknown[]): TypeNode => ({ kind: "union", value }),
  valueSet: (value: SetValue[]): TypeNode => ({ kind: "valueSet", value }),
  typeRef: (value: string): TypeNode => ({ kind: "typeRef", value }),
};

/** render a literal the way TypeScript would print it in a hover tooltip */
export function formatLiteral(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.map(formatLiteral).join(", ")}]`;
  if (typeof value !== "string") return String(value);
  const bare =
    PRIMITIVES.has(value) ||
    value.endsWith("[]") ||
    value.includes("<") ||
    value.startsWith("{") ||
    value.startsWith("[") ||
    value.includes("=>") ||
    /^[A-Z][a-zA-Z0-9]*$/.test(value);
  return bare ? value : JSON.stringify(value);
}

function formatUnion(values: unknown[]): string {
  return values.length === 0 ? "never" : values.map(formatLiteral).join(" | ");
}

/** de-duplicate ids within one stack, so `{ a: 1, a: 1 }` still animates */
function namespaceIds(segments: TypeSegment[], prefix: string): TypeSegment[] {
  const seen = new Map<string, number>();
  return segments.map((segment) => {
    const id = `${prefix}-${segment.id}`;
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    return { ...segment, id: n === 0 ? id : `${id}-${n}` };
  });
}

export function nodeToSegments(
  node: TypeNode,
  theme: TokenTheme,
  prefix: string,
): TypeSegment[] {
  switch (node.kind) {
    case "raw":
    case "typeRef":
      return namespaceIds(segmentType(node.value, theme), prefix);
    case "functionSignature":
      return namespaceIds(segmentType(node.value, theme, "signature"), prefix);
    case "segments":
      return namespaceIds(node.value, prefix);
    case "literal":
      return namespaceIds(
        segmentType(formatLiteral(node.value), theme),
        prefix,
      );
    case "union":
      return namespaceIds(segmentType(formatUnion(node.value), theme), prefix);
    case "valueSet":
      return namespaceIds(
        segmentValueSet(
          node.value.filter((v) => v !== null && v !== undefined),
          theme,
          prefix,
        ),
        prefix,
      );
    default:
      return [];
  }
}

/** join segment ids; changing this key is what re-triggers a stack's flash */
export function segmentsKey(segments: TypeSegment[]): string {
  return segments.map((s) => s.id).join(",");
}
