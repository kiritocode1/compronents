/**
 * Visual Types lesson specs.
 *
 * The complete catalogue from types.kitlangton.com: 24 lessons in 5 groups,
 * rendered by src/components/site/types-viz.tsx. Each lesson is a list of steps
 * and each step is a column of stacks with arrows between them; the engine
 * morphs one step's stacks into the next by segment id.
 *
 * Three shapes cover most of it, so they have builders:
 *   setSteps   a type above the set of values that inhabit it
 *   callSteps  a type-level call above the type it evaluates to
 *   exprSteps  a bare expression above its result
 *
 * The rest (the subtype Venn diagram, the two-stage unknown/any lesson, Pick's
 * key list) are written out per lesson.
 */

import type {
  IntermediateStep,
  ResultDisplay,
  StackStatus,
  TypeLesson,
  TypeStep,
} from "@/components/site/types-viz";
import { type SetValue, type TypeNode, t } from "@/lib/type-tokens";

// ---------------------------------------------------------------------------
// step builders
// ---------------------------------------------------------------------------

/** `boolean` over `{ true, false }`: the type and its inhabitants */
function setSteps(
  rows: { type: string; values: SetValue[]; note?: string }[],
): TypeStep[] {
  return rows.map((row) => ({
    stacks: [
      { kind: "expr", expression: t.raw(row.type) },
      { kind: "result", result: t.valueSet(row.values) },
    ],
    note: row.note,
  }));
}

/** `Filter<A, B>` over its evaluated result */
function callSteps(
  rows: {
    name?: string;
    args: (TypeNode | string)[];
    result?: TypeNode;
    display?: ResultDisplay;
    intermediateSteps?: IntermediateStep[];
    definition?: string;
    note?: string;
  }[],
): TypeStep[] {
  return rows.map((row) => ({
    definition: row.definition,
    note: row.note,
    stacks: [
      {
        kind: "call",
        name: row.name ?? "",
        args: row.args.map((a) => (typeof a === "string" ? t.raw(a) : a)),
        intermediateSteps: row.intermediateSteps,
      },
      { kind: "result", result: row.result, display: row.display },
    ],
  }));
}

/** a bare expression over its result; the unnamed case of callSteps */
function exprSteps(
  rows: {
    expression: string;
    result?: string;
    display?: ResultDisplay;
    definition?: string;
    note?: string;
  }[],
): TypeStep[] {
  return callSteps(
    rows.map((row) => ({
      args: [row.expression],
      result: row.result === undefined ? undefined : t.raw(row.result),
      display: row.display,
      definition: row.definition,
      note: row.note,
    })),
  );
}

/** `K = "name"` -> `name: string`, the per-member rows under a mapped type */
function member(arg: string, result: string): IntermediateStep {
  return { call: { name: "", args: [t.raw(arg)] }, result: t.raw(result) };
}

// ---------------------------------------------------------------------------
// Foundation
// ---------------------------------------------------------------------------

const typesAsSets: TypeLesson = {
  name: "types-as-sets",
  title: "Types as Sets",
  group: "Foundation",
  explainer:
    "A type is a label for **a set of possible runtime values**. Some types are small, some infinite, and some special cases exist at the extremes.",
  steps: setSteps([
    {
      type: "boolean",
      values: [true, false],
      note: "`boolean` contains exactly two values: `true` and `false`.",
    },
    {
      type: "Direction",
      values: ["north", "east", "south", "west"],
      note: "`Direction` is a **union** of four **literal types**. We'll discuss these terms shortly.",
    },
    {
      type: "number",
      values: ["-Infinity", "...", -5, 0, 1, 3.14, 42, "...", "Infinity"],
      note: "`number` contains all values from `-Infinity` to `Infinity`, including decimals.",
    },
    {
      type: "string",
      values: ["", "a", "b", "ab", "..."],
      note: "`string` contains all possible text values, infinite in practice.",
    },
    {
      type: "never",
      values: [],
      note: "`never` is the empty set. It contains no values. No value can ever *inhabit* `never`.",
    },
    {
      type: "any",
      values: [true, 42.5, "hello", "{}", "[]", "..."],
      note: "`any` / `unknown` represent the universal set, containing all possible values.",
    },
    {
      type: "unknown",
      values: [true, 42.5, "hello", "{}", "[]", "..."],
      note: "`any` / `unknown` represent the universal set, containing all possible values.",
    },
    {
      type: "undefined",
      values: ["undefined"],
      note: "`undefined` contains exactly one value: the primitive value `undefined`.",
    },
    {
      type: "null",
      values: ["null"],
      note: "`null` contains exactly one value: the primitive value `null`.",
    },
  ]),
};

const literalTypes: TypeLesson = {
  name: "literal-types",
  title: "Literal Types",
  group: "Foundation",
  explainer:
    "A literal type represents a single, exact value. Unlike `number` which contains all numbers, the literal type `42` contains only one value: 42.",
  steps: setSteps([
    { type: "42", values: [42] },
    { type: '"hello"', values: ["hello"] },
    { type: "true", values: [true] },
    { type: "57", values: [57] },
    { type: '"world"', values: ["world"] },
    { type: "false", values: [false] },
  ]),
};

const unionTypes: TypeLesson = {
  name: "union-types",
  title: "Union Types",
  group: "Foundation",
  explainer:
    'A union type combines multiple types using `|`. The resulting set contains all values from each member type. `"red" | "blue"` contains exactly two values, while `string | number` contains all strings and all numbers.',
  steps: setSteps([
    { type: "true | false", values: [true, false] },
    { type: 'true | false | "maybe"', values: [true, false, "maybe"] },
    { type: 'boolean | "maybe"', values: [true, false, "maybe"] },
    {
      type: "boolean | string",
      values: [true, false, "", "a", "maybe", "..."],
    },
    { type: '"red" | "blue"', values: ["red", "blue"] },
    { type: '"red" | "blue" | "green"', values: ["red", "blue", "green"] },
    { type: "1 | 2 | 3", values: [1, 2, 3] },
    { type: '"hello" | 42', values: ["hello", 42] },
    { type: "string | number", values: ["", "a", "...", -5, 0, 42, "..."] },
  ]),
};

const subtypesAsSubsets: TypeLesson = {
  name: "subtypes-as-subsets",
  title: "Subtypes as Subsets",
  group: "Foundation",
  explainer:
    "`A extends B` means A is a subtype of B. If types are sets, then subtypes are subsets. Type A is a subtype of B when every value in A exists in B (including when A and B are identical).",
  steps: (
    [
      ["true", "boolean", true],
      ["boolean", "boolean", true],
      ["boolean", "true", false],
      ["false", "true", false],
      ['false | "maybe"', '"maybe" | true', false],
      ['"kit"', "string", true],
      ["never", "string", true],
      ["string", "any", true],
    ] as const
  ).map(
    ([leftType, rightType, result]) =>
      ({
        stacks: [{ kind: "subset", leftType, rightType, result }],
      }) as TypeStep,
  ),
};

const tupleTypes: TypeLesson = {
  name: "tuple-types",
  title: "Tuple Types",
  group: "Foundation",
  explainer:
    "A **tuple type** is a fixed-length array where each position has a specific type. Unlike regular arrays, tuples have known length and heterogeneous types.",
  steps: setSteps([
    { type: "[boolean]", values: [[true], [false]] },
    {
      type: "[boolean, boolean]",
      values: [
        [true, true],
        [true, false],
        [false, true],
        [false, false],
      ],
    },
    {
      type: "[boolean, string]",
      values: [[true, ""], [false, ""], [true, "hello"], "..."],
    },
    {
      type: "[boolean, string, number]",
      values: [[true, "", 0], [false, "", 1], [true, "hello", 2], "..."],
    },
    {
      type: "[string, number]",
      values: [["", 0], ["", 1], ["hello", 2], "..."],
    },
  ]),
};

const objectTypes: TypeLesson = {
  name: "object-types",
  title: "Object Types",
  group: "Foundation",
  explainer:
    "Object types define sets based on their properties. `{ id: number }` represents the set of all objects that have at least an `id` property of type `number`. Objects with extra properties still belong to this set.",
  steps: setSteps([
    {
      type: "{ alive: boolean }",
      values: ["{alive:true}", "{alive:false}", "{alive:true,x:1}", "..."],
    },
    {
      type: "{ id: number }",
      values: ["{id:0}", "{id:42}", "{id:1,name:'x'}", "..."],
    },
    {
      type: "{ x: number; y: number }",
      values: ["{x:0,y:0}", "{x:1,y:2}", "{x:0,y:0,z:5}", "..."],
    },
    {
      type: "{ x: number; y?: number }",
      values: ["{x:1,y:2}", "{x:5}", "{x:0,y:0}", "..."],
      note: "The `?` modifier makes a property optional. Objects can either include the property or omit it entirely. Both are valid members of the type.",
    },
  ]),
};

const primitiveIntersectionNote =
  "Primitive types have disjoint sets of values; no value can be both `string` and `number`. The intersection is empty: `never`.";
const objectIntersectionNote =
  "Objects merge properties. An intersection requires values satisfying *all* constraints; objects must have both property sets.";

const intersectionTypes: TypeLesson = {
  name: "intersection-types",
  title: "Intersection Types",
  group: "Foundation",
  explainer:
    "The `&` operator creates an intersection containing only values that belong to BOTH types. For primitives like `string & number`, no value can be both, so the result is `never`. Objects must satisfy all properties from both sides.",
  steps: callSteps([
    {
      args: ["string & number"],
      result: t.raw("never"),
      note: primitiveIntersectionNote,
    },
    {
      args: ["true & false"],
      result: t.raw("never"),
      note: primitiveIntersectionNote,
    },
    {
      args: ["{ x: number } & { y: number }"],
      result: t.raw("{ x: number; y: number }"),
      note: objectIntersectionNote,
    },
    {
      args: ["{ id: number } & { name: string }"],
      result: t.raw("{ id: number; name: string }"),
      note: objectIntersectionNote,
    },
    {
      args: ["{ x: number } & { x: string }"],
      result: t.raw("{ x: never }"),
      note: "When the same property has incompatible types, the property itself becomes the intersection of those types. Since `number & string` is `never`, the result is `{ x: never }`.",
    },
    {
      args: ["{ x: { a: number } } & { x: { b: string } }"],
      result: t.raw("{ x: { a: number; b: string } }"),
      note: "When the same property has object types, those objects are intersected. The property becomes the intersection of the object types, merging their properties: `{ a: number } & { b: string }` = `{ a: number; b: string }`.",
    },
  ]),
};

// ---------------------------------------------------------------------------
// Basics II
// ---------------------------------------------------------------------------

const typeAliases: TypeLesson = {
  name: "type-aliases",
  title: "Type Aliases",
  group: "Basics II",
  explainer:
    "Type aliases let you name a type. Using the alias is identical to using the type it points to; they are completely transparent.",
  steps: callSteps([
    {
      args: [t.typeRef("UserId")],
      result: t.raw("string"),
      definition: "type UserId = string",
    },
    {
      args: [t.typeRef("Point")],
      result: t.raw("{ x: number; y: number }"),
      definition: "type Point = { x: number; y: number }",
    },
    {
      args: [t.typeRef("Status")],
      result: t.raw('"pending" | "success" | "error"'),
      definition: 'type Status = "pending" | "success" | "error"',
    },
  ]),
};

const genericTypesCode = `type Identity<T> = T
type Nullable<T> = T | null
type Pair<T> = [T, T]
type Box<T> = { value: T }
type KeyValue<K, V> = { key: K; value: V }`;

const multipleParamsNote =
  "Generic type aliases can take multiple type parameters. Each parameter is substituted independently when the type is applied.";

const genericTypes: TypeLesson = {
  name: "generic-types",
  title: "Generic Types",
  group: "Basics II",
  code: genericTypesCode,
  explainer:
    "Think of generic type aliases as **type-level functions**. Just as a function takes values and returns a new value, a generic type alias takes types as parameters and returns a new type.",
  steps: callSteps([
    { name: "Identity", args: ["string"], result: t.raw("string") },
    { name: "Identity", args: ["number"], result: t.raw("number") },
    { name: "Nullable", args: ["string"], result: t.raw("string | null") },
    { name: "Nullable", args: ["number"], result: t.raw("number | null") },
    { name: "Pair", args: ["string"], result: t.raw("[string, string]") },
    { name: "Pair", args: ["boolean"], result: t.raw("[boolean, boolean]") },
    { name: "Box", args: ["number"], result: t.raw("{ value: number }") },
    {
      name: "KeyValue",
      args: ["string", "number"],
      result: t.raw("{ key: string; value: number }"),
      note: multipleParamsNote,
    },
    {
      name: "KeyValue",
      args: ["number", "boolean"],
      result: t.raw("{ key: number; value: boolean }"),
      note: multipleParamsNote,
    },
  ]),
};

const typeofLesson: TypeLesson = {
  name: "typeof",
  title: "typeof",
  group: "Basics II",
  explainer:
    "The `typeof` operator extracts the type from a runtime value. Unlike JavaScript's `typeof` which runs at runtime, TypeScript's `typeof` operates at compile-time to capture the inferred type.",
  steps: exprSteps([
    {
      expression: "typeof message",
      result: "string",
      definition: 'const message = "hello"',
    },
    {
      expression: "typeof count",
      result: "number",
      definition: "const count = 42",
    },
    {
      expression: "typeof isActive",
      result: "boolean",
      definition: "const isActive = true",
    },
    {
      expression: "typeof point",
      result: "{ x: number; y: number }",
      definition: "const point = { x: 10, y: 20 }",
    },
    {
      expression: "typeof numbers",
      result: "number[]",
      definition: "const numbers = [1, 2, 3]",
    },
    {
      expression: "typeof user",
      result: "{ name: string; age: number }",
      definition: 'const user = { name: "Alice", age: 30 }',
    },
  ]),
};

const asConst: TypeLesson = {
  name: "as-const",
  title: "as const",
  group: "Basics II",
  explainer:
    "`as const` makes object properties and array elements readonly with literal types. Even with `const`, object/array values are normally widened, and `as const` prevents this.",
  steps: exprSteps([
    {
      expression: "typeof config",
      result: "{ host: string; port: number }",
      definition: 'const config = { host: "localhost", port: 8080 }',
      note: "Without `as const`, object properties are mutable and types are widened (`string`, `number`).",
    },
    {
      expression: "typeof config",
      result: '{ readonly host: "localhost"; readonly port: 8080 }',
      definition: 'const config = { host: "localhost", port: 8080 } as const',
      note: 'With `as const`, properties become `readonly` with exact literal types (`"localhost"`, `8080`).',
    },
    {
      expression: "typeof colors",
      result: "string[]",
      definition: 'const colors = ["red", "green", "blue"]',
      note: "Arrays are normally mutable `string[]` even with `const`.",
    },
    {
      expression: "typeof colors",
      result: 'readonly ["red", "green", "blue"]',
      definition: 'const colors = ["red", "green", "blue"] as const',
      note: "With `as const`, you get a readonly tuple with literal element types.",
    },
    {
      expression: "typeof user",
      result: "{ name: string; tags: string[] }",
      definition: 'const user = { name: "Alice", tags: ["admin", "user"] }',
      note: "Nested arrays are also widened, so `tags` becomes `string[]`.",
    },
    {
      expression: "typeof user",
      result:
        '{ readonly name: "Alice"; readonly tags: readonly ["admin", "user"] }',
      definition:
        'const user = { name: "Alice", tags: ["admin", "user"] } as const',
      note: "`as const` deeply applies readonly and literal types to all nested structures.",
    },
  ]),
};

/**
 * The only lesson with two result stacks: what the type checker says, then what
 * the runtime does. The point is the disagreement, so a step where the compiler
 * refused renders its runtime stack as a ghost box reading "Not executed".
 */
function unknownStep(row: {
  expression: string;
  definition: string;
  typeResult: string;
  typeMessage: string;
  typeStatus: StackStatus;
  runtimeMessage: string;
  runtimeStatus?: StackStatus;
  runtimeGhost?: boolean;
}): TypeStep {
  return {
    definition: row.definition,
    transitions: [{ label: "type checker" }, { label: "runtime" }],
    stacks: [
      { kind: "call", name: "", args: [t.raw(row.expression)] },
      {
        kind: "result",
        result: t.raw(row.typeResult),
        display: { message: row.typeMessage, status: row.typeStatus },
      },
      {
        kind: "result",
        ghost: row.runtimeGhost,
        display: {
          message: row.runtimeMessage,
          status: row.runtimeStatus ?? "neutral",
        },
      },
    ],
  };
}

const unknownVsAny: TypeLesson = {
  name: "unknown-vs-any",
  title: "unknown vs any",
  group: "Basics II",
  explainer:
    "`any` switches the type checker off; `unknown` keeps it on and makes you narrow first. Both hold any value, but only one of them lets a broken call through to the runtime.",
  steps: [
    unknownStep({
      expression: "x + 10",
      definition: "const x: any = 5\nx + 10",
      typeResult: "no error",
      typeMessage: "Type-checks!",
      typeStatus: "success",
      runtimeMessage: "15",
      runtimeStatus: "success",
    }),
    unknownStep({
      expression: "x + 10",
      definition: "const x: unknown = 5\nx + 10",
      typeResult: "error",
      typeMessage: "'x' is of type 'unknown'",
      typeStatus: "error",
      runtimeMessage: "Not executed",
      runtimeGhost: true,
    }),
    unknownStep({
      expression: "if (typeof x === 'number') { x + 10 }",
      definition: "const x: unknown = 5\nif (typeof x === 'number') { x + 10 }",
      typeResult: "no error",
      typeMessage: "After narrowing, type-checks!",
      typeStatus: "success",
      runtimeMessage: "15",
      runtimeStatus: "success",
    }),
    unknownStep({
      expression: "x.toUpperCase()",
      definition: "const x: any = 5\nx.toUpperCase()",
      typeResult: "no error",
      typeMessage: "Type-checks!",
      typeStatus: "success",
      runtimeMessage: "x.toUpperCase is not a function",
      runtimeStatus: "error",
    }),
    unknownStep({
      expression: "x.toUpperCase()",
      definition: "const x: unknown = 5\nx.toUpperCase()",
      typeResult: "error",
      typeMessage: "'x' is of type 'unknown'",
      typeStatus: "error",
      runtimeMessage: "Not executed",
      runtimeGhost: true,
    }),
    unknownStep({
      expression: "if (typeof x === 'string') { x.toUpperCase() }",
      definition:
        "const x: unknown = 5\nif (typeof x === 'string') { x.toUpperCase() }",
      typeResult: "no error",
      typeMessage: "Type-checks!",
      typeStatus: "success",
      runtimeMessage: "No output",
      runtimeStatus: "success",
    }),
  ],
};

// ---------------------------------------------------------------------------
// Object Patterns
// ---------------------------------------------------------------------------

const keyofLesson: TypeLesson = {
  name: "keyof",
  title: "keyof",
  group: "Object Patterns",
  explainer:
    "The `keyof` operator extracts all property keys from an object type as a union of string literals. This is essential for type-safe property access and building mapped types.",
  steps: exprSteps([
    { expression: "keyof { a: number; b: string }", result: '"a" | "b"' },
    {
      expression: "keyof { x: number; y: number; z: number }",
      result: '"x" | "y" | "z"',
    },
    {
      expression: "keyof Config",
      result: '"theme" | "port"',
      definition: "type Config = { theme: 'light' | 'dark'; port: number }",
      note: "`keyof` works with type aliases too: it extracts all property keys from the aliased type.",
    },
    { expression: "keyof { id: number }", result: '"id"' },
    {
      expression: "keyof { name: string; age: number; active: boolean }",
      result: '"name" | "age" | "active"',
    },
  ]),
};

const indexedAccess: TypeLesson = {
  name: "indexed-access",
  title: "Indexed Access",
  group: "Object Patterns",
  explainer:
    "Indexed access reads a property type out of an object or tuple type with `T[K]`, exactly the way you would read a value out at runtime. Indexing with a union of keys gives you a union of property types.",
  steps: exprSteps([
    {
      expression: '{ color: string; size: number }["color"]',
      result: "string",
    },
    { expression: '{ color: string; size: number }["size"]', result: "number" },
    {
      expression: '{ color: string; size: number }["color" | "size"]',
      result: "string | number",
    },
    {
      expression: 'Person["name"]',
      result: "string",
      definition: "type Person = { name: string; age: number }",
    },
    {
      expression: 'Person["age"]',
      result: "number",
      definition: "type Person = { name: string; age: number }",
    },
    {
      expression: "Person[keyof Person]",
      result: "string | number",
      definition: "type Person = { name: string; age: number }",
    },
    {
      expression: 'User["email"]',
      result: "string | undefined",
      definition: "type User = { username: string; email?: string }",
    },
    {
      expression: 'User["invalid"]',
      display: {
        message: "Property 'invalid' does not exist on type 'User'",
        status: "error",
      },
      definition: "type User = { username: string; email?: string }",
    },
    {
      expression: "Stuff[0]",
      result: "'list'",
      definition: 'type Stuff = ["list", 42, { tag: "union" }]',
    },
    {
      expression: "Stuff[1]",
      result: "42",
      definition: 'type Stuff = ["list", 42, { tag: "union" }]',
    },
    {
      expression: "Stuff[2]",
      result: '{ tag: "union" }',
      definition: 'type Stuff = ["list", 42, { tag: "union" }]',
    },
    {
      expression: "Stuff[number]",
      result: "'list' | 42 | { tag: \"union\" }",
      definition: 'type Stuff = ["list", 42, { tag: "union" }]',
    },
  ]),
};

const mappedIterationNote =
  "The `[K in ...]` syntax iterates over the union, creating a property for each member. Each iteration adds one property to the resulting object type.";

const mappedTypes: TypeLesson = {
  name: "mapped-types",
  title: "Mapped Types",
  group: "Object Patterns",
  explainer:
    "Mapped types use `[K in ...]` to iterate over keys and create new object types.",
  steps: callSteps([
    {
      args: ['{ [K in "x" | "y"]: number }'],
      result: t.raw("{ x: number; y: number }"),
      intermediateSteps: [
        member('K = "x"', "x: number"),
        member('K = "y"', "y: number"),
      ],
      note: mappedIterationNote,
    },
    {
      args: ['{ [K in "name" | "title"]: string }'],
      result: t.raw("{ name: string; title: string }"),
      intermediateSteps: [
        member('K = "name"', "name: string"),
        member('K = "title"', "title: string"),
      ],
      note: mappedIterationNote,
    },
    {
      args: ['{ [K in "a" | "b" | "c"]: boolean }'],
      result: t.raw("{ a: boolean; b: boolean; c: boolean }"),
      intermediateSteps: [
        member('K = "a"', "a: boolean"),
        member('K = "b"', "b: boolean"),
        member('K = "c"', "c: boolean"),
      ],
      note: mappedIterationNote,
    },
    {
      args: ["Stringify<Person>"],
      result: t.raw("{ name: string; age: string }"),
      intermediateSteps: [
        member('K = "name"', "name: string"),
        member('K = "age"', "age: string"),
      ],
      definition:
        "type Person = { name: string; age: number }\n\ntype Stringify<T> = { [K in keyof T]: string }",
      note: '`keyof Person` gives us `"name" | "age"`. Instead of preserving original types with `T[K]`, we transform all values to `string`.',
    },
    {
      args: ["MakeOptional<Person>"],
      result: t.raw("{ name?: string; age?: number }"),
      intermediateSteps: [
        member('K = "name"', "name?: string"),
        member('K = "age"', "age?: number"),
      ],
      definition:
        "type Person = { name: string; age: number }\n\ntype MakeOptional<T> = { [K in keyof T]?: T[K] }",
      note: "The `?` modifier makes properties optional. Using `T[K]` preserves the original property types from `Person`.",
    },
  ]),
};

// ---------------------------------------------------------------------------
// Conditional Types
// ---------------------------------------------------------------------------

const neverSubsetNote =
  "`never` is the empty set; it contains no values. By definition, the empty set is a subset of every set.";

const conditionalTypes: TypeLesson = {
  name: "conditional-types",
  title: "Conditional Types",
  group: "Conditional Types",
  explainer:
    "Conditional types are type-level ternaries. The syntax `T extends U ? X : Y` checks whether T is a subset of U, then evaluates to X if true or Y if false.",
  steps: callSteps(
    (
      [
        ['"red" extends string ? "yes" : "no"', "yes"],
        ['42 extends number ? "yes" : "no"', "yes"],
        ['string extends "red" ? "yes" : "no"', "no"],
        ['number extends 42 ? "yes" : "no"', "no"],
        ['"red" extends "red" | "blue" ? "yes" : "no"', "yes"],
        ['"green" extends "red" | "blue" ? "yes" : "no"', "no"],
        ['never extends string ? "yes" : "no"', "yes"],
        ['never extends number ? "yes" : "no"', "yes"],
        ['any extends string ? "yes" : "no"', "yes"],
      ] as const
    ).map(([expression, result], i) => ({
      args: [expression],
      result: t.literal(result),
      note:
        i === 6 || i === 7
          ? neverSubsetNote
          : i === 8
            ? "`any` is TypeScript's escape hatch. It breaks normal type rules and behaves as if it extends everything (and everything extends it)."
            : undefined,
    })),
  ),
};

const reflexivity: TypeLesson = {
  name: "reflexivity",
  title: "Reflexivity",
  group: "Conditional Types",
  explainer:
    "In TypeScript, every type extends itself. This is called **reflexivity**.",
  steps: callSteps(
    (["string", "42", "never", "{ name: string }"] as const).map((type) => ({
      args: [`${type} extends ${type} ? true : false`],
      result: t.raw("true"),
    })),
  ),
};

const conditionalUnions: TypeLesson = {
  name: "conditional-unions",
  title: "Conditional Unions",
  group: "Conditional Types",
  explainer:
    "When a union is evaluated, TypeScript processes each member individually and then unions the results together. This behavior is called **distributivity**.",
  steps: callSteps(
    (
      [
        ["42 extends string ? string : number", "number", ["42"]],
        ["(42 | 99) extends string ? string : number", "number", ["42", "99"]],
        [
          '(42 | 99 | "cat") extends string ? string : number',
          "string | number",
          ["42", "99", '"cat"'],
        ],
        [
          '(42 | 99 | "cat" | "dog") extends string ? string : number',
          "string | number",
          ["42", "99", '"cat"', '"dog"'],
        ],
        [
          '("cat" | "dog") extends string ? string : number',
          "string",
          ['"cat"', '"dog"'],
        ],
        [
          '("cat" | "dog" | "bird") extends string ? string : number',
          "string",
          ['"cat"', '"dog"', '"bird"'],
        ],
      ] as const
    ).map(([expression, result, members]) => ({
      args: [expression],
      result: t.raw(result),
      intermediateSteps: members.map((m) =>
        member(
          `${m} extends string ? string : number`,
          m.startsWith('"') ? "string" : "number",
        ),
      ),
    })),
  ),
};

const conditionalNonDistribution: TypeLesson = {
  name: "conditional-non-distribution",
  title: "Conditional Non-Distribution",
  group: "Conditional Types",
  explainer:
    "Wrap types in tuples `[T] extends [U]` to disable distribution. This checks if the entire union extends the target type, rather than distributing over individual members.",
  steps: callSteps([
    {
      name: "WrapInArray",
      args: ["string | number"],
      result: t.raw("(string | number)[]"),
      definition: "type WrapInArray<T> = [T] extends [unknown] ? T[] : never;",
      note: "The tuple wrapper keeps the union together as a single array type: `(string | number)[]`.",
    },
    {
      name: "WrapInArrayBroken",
      args: ["string | number"],
      result: t.raw("string[] | number[]"),
      definition:
        "type WrapInArrayBroken<T> = T extends unknown ? T[] : never;",
      note: "Without the tuple wrapper, the conditional distributes over each member, producing `string[] | number[]`.",
    },
    {
      name: "AllExtend",
      args: ['"cat" | "dog"', "string"],
      result: t.literal(true),
      definition: "type AllExtend<T, U> = [T] extends [U] ? true : false;",
      note: "All union members extend `string`, so the whole union extends `string`.",
    },
    {
      name: "AllExtend",
      args: ['"cat" | 42', "string"],
      result: t.literal(false),
      definition: "type AllExtend<T, U> = [T] extends [U] ? true : false;",
      note: "The union contains both `string` and `number`, so it doesn't extend `string`.",
    },
    {
      name: "AllExtendBroken",
      args: ['"cat" | 42', "string"],
      result: t.raw("true | false"),
      definition: "type AllExtendBroken<T, U> = T extends U ? true : false;",
      note: 'Without the tuple wrapper, each member is checked separately: `"cat"` extends `string` (true) and `42` extends `string` (false), giving the ambiguous result `true | false`.',
    },
  ]),
};

const filterDefinition = "type Filter<T, Match> = T extends Match ? T : never;";

const conditionalFilters: TypeLesson = {
  name: "conditional-filters",
  title: "Conditional Filters",
  group: "Conditional Types",
  code: filterDefinition,
  explainer:
    "Use `never` to drop non-matching branches; the pieces that return `never` disappear from the union.",
  steps: callSteps([
    {
      name: "Filter",
      args: ["string | number", "string"],
      result: t.raw("string"),
    },
    {
      name: "Filter",
      args: ["string | number", "number"],
      result: t.raw("number"),
    },
    {
      name: "Filter",
      args: ["string | number | boolean", "number"],
      result: t.raw("number"),
    },
    {
      name: "Filter",
      args: ["string | number | boolean", "string"],
      result: t.raw("string"),
    },
    {
      name: "Filter",
      args: ['"cat" | 42', "string"],
      result: t.literal("cat"),
    },
    { name: "Filter", args: ['"cat" | 42', "number"], result: t.literal(42) },
    {
      name: "Filter",
      args: ['"cat" | "dog" | 42', "string"],
      result: t.union(["cat", "dog"]),
    },
  ]),
};

const inferLesson: TypeLesson = {
  name: "infer",
  title: "infer",
  group: "Conditional Types",
  explainer:
    "`infer` lets conditional types capture part of a matched shape and reuse it later in the same branch.",
  steps: callSteps([
    {
      name: "UnwrapPromise",
      args: ["Promise<string>"],
      result: t.raw("string"),
      definition:
        "type UnwrapPromise<T> =\n  T extends Promise<infer Value> ? Value : T",
      note: "Matches `Promise<infer Value>` so `Value` becomes `string`.",
    },
    {
      name: "UnwrapPromise",
      args: ["string"],
      result: t.raw("string"),
      definition:
        "type UnwrapPromise<T> =\n  T extends Promise<infer Value> ? Value : T",
      note: "Not a promise, so the conditional falls through and returns the original `string`.",
    },
    {
      name: "ValueOf",
      args: ["{ value: number; label: string }"],
      result: t.raw("number"),
      definition:
        "type ValueOf<T> =\n  T extends { value: infer V } ? V : never",
      note: "Matches `{ value: infer V }`, so `V` is inferred as `number`.",
    },
    {
      name: "ValueOf",
      args: ["{ id: string }"],
      result: t.raw("never"),
      definition:
        "type ValueOf<T> =\n  T extends { value: infer V } ? V : never",
      note: "There is no `value` property to match, so `ValueOf` returns `never`.",
    },
    {
      name: "FlattenArray",
      args: ["number[]"],
      result: t.raw("number"),
      definition:
        "type FlattenArray<T> =\n  T extends (infer Item)[] ? Item : T",
      note: "`(infer Item)[]` binds `Item` to `number`.",
    },
    {
      name: "FlattenArray",
      args: ["(string | number)[]"],
      result: t.raw("string | number"),
      definition:
        "type FlattenArray<T> =\n  T extends (infer Item)[] ? Item : T",
      note: "The array holds a union, so `Item` becomes `string | number`.",
    },
    {
      name: "FlattenArray",
      args: ["string"],
      result: t.raw("string"),
      definition:
        "type FlattenArray<T> =\n  T extends (infer Item)[] ? Item : T",
      note: "Not an array, so `FlattenArray` simply returns `string`.",
    },
  ]),
};

// ---------------------------------------------------------------------------
// Utility Types
// ---------------------------------------------------------------------------

const pick: TypeLesson = {
  name: "pick",
  title: "Pick",
  group: "Utility Types",
  code: "type Pick<T, K extends keyof T> = {\n  [P in K]: T[P]\n}",
  explainer:
    "`Pick` keeps only the properties you name. It is a mapped type over `K` rather than over `keyof T`, so the keys you leave out never make it into the result.",
  steps: callSteps(
    (
      [
        [
          "{ a: number; b: string; c: boolean }",
          ["a", "b"],
          "{ a: number; b: string }",
        ],
        ["{ a: number; b: string; c: boolean }", ["b"], "{ b: string }"],
        [
          "{ x: number; y: number; z: number }",
          ["x", "y"],
          "{ x: number; y: number }",
        ],
        [
          "{ x: number; y: string; z: boolean }",
          ["x", "y"],
          "{ x: number; y: string }",
        ],
      ] as const
    ).map(([objectType, keys, result]) => ({
      name: "Pick",
      args: [objectType, keys.map((k) => `"${k}"`).join(" | ")],
      result: t.raw(result),
      intermediateSteps: keys.map((k) =>
        member(`P = "${k}"`, `${k}: T["${k}"]`),
      ),
    })),
  ),
};

const returnType: TypeLesson = {
  name: "return-type",
  title: "Return Type",
  group: "Utility Types",
  code: "type ReturnType<T extends (...args: any) => any> =\n  T extends (...args: any) => infer R ? R : any",
  explainer:
    "`ReturnType` uses `infer` in the return position, so it captures whatever the function hands back and discards the parameters.",
  steps: callSteps(
    (
      [
        ["() => string", "string"],
        ["() => number", "number"],
        ["() => { id: number; name: string }", "{ id: number; name: string }"],
        ["() => number[]", "number[]"],
      ] as const
    ).map(([signature, result]) => ({
      name: "ReturnType",
      args: [t.functionSignature(signature)],
      result: t.raw(result),
    })),
  ),
};

const parameters: TypeLesson = {
  name: "parameters",
  title: "Parameters",
  group: "Utility Types",
  code: "type Parameters<T extends (...args: any) => any> =\n  T extends (...args: infer P) => any ? P : never",
  explainer:
    "`Parameters` is the mirror image of `ReturnType`: `infer P` sits in the rest-parameter position, so the whole argument list comes back as a tuple.",
  steps: callSteps(
    (
      [
        ["(x: number, y: string) => void", "[number, string]"],
        [
          "(id: number, name: string, email: string) => void",
          "[number, string, string]",
        ],
        [
          "(user: { id: number; name: string }) => void",
          "[{ id: number; name: string }]",
        ],
        ["() => void", "[]"],
      ] as const
    ).map(([signature, result]) => ({
      name: "Parameters",
      args: [t.functionSignature(signature)],
      result: t.raw(result),
    })),
  ),
};

// ---------------------------------------------------------------------------
// catalogue
// ---------------------------------------------------------------------------

/** every lesson, in the order the site presents them */
export const typeLessons: TypeLesson[] = [
  typesAsSets,
  literalTypes,
  unionTypes,
  subtypesAsSubsets,
  tupleTypes,
  objectTypes,
  intersectionTypes,
  typeAliases,
  genericTypes,
  typeofLesson,
  asConst,
  unknownVsAny,
  keyofLesson,
  indexedAccess,
  mappedTypes,
  conditionalTypes,
  reflexivity,
  conditionalUnions,
  conditionalNonDistribution,
  conditionalFilters,
  inferLesson,
  pick,
  returnType,
  parameters,
];

/** the five groups, in order, with their lessons */
export const typeGroups: { title: string; lessons: TypeLesson[] }[] = [
  "Foundation",
  "Basics II",
  "Object Patterns",
  "Conditional Types",
  "Utility Types",
].map((title) => ({
  title,
  lessons: typeLessons.filter((lesson) => lesson.group === title),
}));

export function getTypeLesson(name: string): TypeLesson | undefined {
  return typeLessons.find((lesson) => lesson.name === name);
}

/**
 * Every distinct snippet a lesson can show, so a server component can shiki them
 * all up front. Definitions are real TypeScript statements, not type
 * expressions, so they get the site's normal highlighter rather than the
 * segmenter, which only knows how to lay out types.
 */
export function lessonDefinitions(lesson: TypeLesson): string[] {
  const seen = new Set<string>();
  if (lesson.code) seen.add(lesson.code);
  for (const step of lesson.steps) {
    if (step.definition) seen.add(step.definition);
  }
  return [...seen];
}
