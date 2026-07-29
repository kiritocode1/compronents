// Segmenter checks for the Visual Types engine.
//
//   node --test tests/type-tokens.test.mjs
//
// The animation is entirely carried by segment ids: a token that survives a
// step change keeps its id and slides, a token that does not blurs out. So the
// thing worth asserting is id stability across a morph, plus the two colour
// calls that are easy to get subtly wrong (conditional vs property colon,
// parameter vs type name).

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nodeToSegments,
  segmentsKey,
  segmentType,
  segmentValueSet,
  TOKEN_THEMES,
  t,
} from "../src/lib/type-tokens.ts";

const theme = TOKEN_THEMES["github-dark"];
const ids = (segments) => segments.map((s) => s.id);
const text = (segments) => segments.map((s) => s.content).join("");
const find = (segments, content) => segments.find((s) => s.content === content);

test("surviving tokens keep their id when a type morphs", () => {
  // the animation for Union Types step 4 -> 5
  const before = segmentType('"red" | "blue"', theme);
  const after = segmentType('"red" | "blue" | "green"', theme);
  const kept = ids(before).filter((id) => ids(after).includes(id));

  // every token of the shorter type survives into the longer one
  assert.deepEqual(kept, ids(before));
  // and the new member is genuinely new, so it animates in
  assert.ok(ids(after).length > ids(before).length);
  assert.ok(after.some((s) => s.content === '"green"'));
});

test("ids are positional by role, not by array index", () => {
  // inserting a member must not renumber the members after it, or every
  // token downstream would blur out and back in instead of sliding
  const before = segmentType("string | boolean", theme);
  const after = segmentType("string | number | boolean", theme);
  const booleanBefore = find(before, "boolean");
  const booleanAfter = find(after, "boolean");
  assert.equal(booleanBefore.id, booleanAfter.id);
});

test("a conditional colon is an operator, a property colon is punctuation", () => {
  const conditional = segmentType("T extends U ? X : Y", theme);
  const property = segmentType("{ name: string }", theme);

  assert.equal(find(conditional, ":").color, theme.operator);
  assert.equal(find(conditional, ":").id.includes("conditional-colon"), true);
  // property colons carry their trailing space and are emitted as ": "
  assert.equal(find(property, ": ").color, theme.operator);
  assert.equal(find(property, ": ").id.includes("conditional"), false);
});

test("object keys and function parameters colour as parameter names", () => {
  const object = segmentType("{ name: string; age: number }", theme);
  assert.equal(find(object, "name").color, theme.parameterName);
  assert.equal(find(object, "string").color, theme.typeLiteral);

  const fn = segmentType("(x: number) => void", theme);
  assert.equal(find(fn, "x").color, theme.parameterName);

  // a bare type reference is a type name, not a parameter
  const ref = segmentType("Person", theme);
  assert.equal(find(ref, "Person").color, theme.typeName);
});

test("spacing collapses the way TypeScript prints it", () => {
  assert.equal(text(segmentType("{a:number}", theme)), "{ a: number }");
  assert.equal(text(segmentType("string|number", theme)), "string | number");
  // kit's brace-close pads unless the previous segment is already blank, so a
  // genuinely empty object type prints `{ }`. Kept as-is for fidelity; the
  // lessons only ever use `{}` as a value inside a set, never as a type.
  assert.equal(text(segmentType("{}", theme)), "{ }");
  // `T[]` is an array suffix, `Foo[K]` is an indexed access
  assert.equal(text(segmentType("number[]", theme)), "number[]");
  assert.equal(text(segmentType("Person[K]", theme)), "Person[K]");
  // self-spacing operators must not double the source whitespace
  assert.equal(text(segmentType('K = "x"', theme)), 'K = "x"');
  assert.equal(
    text(segmentType("T extends U ? X : Y", theme)),
    "T extends U ? X : Y",
  );
  assert.equal(
    text(segmentType("(x: number) => void", theme)),
    "(x: number) => void",
  );
});

test("value sets render as brace-wrapped members", () => {
  assert.equal(text(segmentValueSet([true, false], theme)), "{ true, false }");
  assert.equal(
    text(segmentValueSet(["red", "blue"], theme)),
    '{ "red", "blue" }',
  );
  // tuples nest, and Infinity prints bare rather than quoted
  assert.equal(text(segmentValueSet([[true, "a"]], theme)), '{ [true, "a"] }');
  assert.equal(text(segmentValueSet(["Infinity"], theme)), "{ Infinity }");
  assert.equal(text(segmentValueSet([], theme)), "{  }");
});

test("node constructors route to the right renderer", () => {
  assert.equal(text(nodeToSegments(t.raw("string"), theme, "p")), "string");
  assert.equal(text(nodeToSegments(t.literal("yes"), theme, "p")), '"yes"');
  assert.equal(text(nodeToSegments(t.literal(42), theme, "p")), "42");
  // a capitalised string is a type name, so it prints bare
  assert.equal(text(nodeToSegments(t.literal("Person"), theme, "p")), "Person");
  assert.equal(
    text(nodeToSegments(t.union(["cat", "dog"]), theme, "p")),
    '"cat" | "dog"',
  );
  // an empty union is the empty set
  assert.equal(text(nodeToSegments(t.union([]), theme, "p")), "never");
  assert.equal(
    text(nodeToSegments(t.valueSet([1, 2]), theme, "p")),
    "{ 1, 2 }",
  );
});

test("prefixes keep two stacks on one screen from colliding", () => {
  const left = nodeToSegments(t.raw("string"), theme, "stack-0");
  const right = nodeToSegments(t.raw("string"), theme, "stack-1");
  assert.notEqual(segmentsKey(left), segmentsKey(right));
  // ...but the same stack rendered twice is stable
  assert.equal(
    segmentsKey(nodeToSegments(t.raw("string"), theme, "stack-0")),
    segmentsKey(left),
  );
});

test("repeated tokens within one stack get distinct ids", () => {
  const segments = segmentType("[boolean, boolean]", theme);
  assert.equal(new Set(ids(segments)).size, segments.length);
});

test("code lines keep their comments intact", () => {
  // backend viz code lines carry trailing comments; `//` must not lex as two
  // divide operators, and the comment text must survive re-spacing verbatim
  const segments = segmentType(
    "sdk.getPost().title // server renamed it weeks ago",
    theme,
  );
  assert.equal(
    text(segments),
    "sdk.getPost().title // server renamed it weeks ago",
  );
  const comment = segments.find((s) => s.content.startsWith("//"));
  assert.equal(comment.color, theme.comment);

  // block comments too, and a lone slash is still an operator
  assert.equal(text(segmentType("a /* note */ b", theme)), "a /* note */ b");
  assert.equal(text(segmentType("a / b", theme)), "a / b");
});

test("method chains do not gain stray spaces", () => {
  const code = "RpcServer.layer(JobsRpc).pipe(Layer.provide(HttpTransport))";
  assert.equal(text(segmentType(code, theme)), code);
});
