import { Expression, ExpressionType, parse } from "../../mod.ts";
import { assertEquals, assertThrows } from "../../deps.ts";

Deno.test("Should parse '{foo}' to a list of expressions", () => {
  const expected: Expression[] = [
    {
      allowReserved: false,
      first: "",
      ifEmpty: "",
      named: false,
      separator: ",",
      terms: [
        {
          explode: false,
          name: "foo",
          truncate: 0,
        },
      ],
      type: ExpressionType.Variable,
    },
  ];

  const actual = parse("{foo}");

  assertEquals(actual, expected);
});

Deno.test("Should parse 'foo/{bar}' to a list of expressions", () => {
  const expected: Expression[] = [{
    type: ExpressionType.Literal,
    value: "foo/",
  }, {
    allowReserved: false,
    first: "",
    ifEmpty: "",
    named: false,
    separator: ",",
    terms: [
      {
        explode: false,
        name: "bar",
        truncate: 0,
      },
    ],
    type: ExpressionType.Variable,
  }];

  assertEquals(parse("foo/{bar}"), expected);
});

Deno.test("Should parse 'foo/{bar}/baz' to a list of expressions", () => {
  const expected: Expression[] = [{
    type: ExpressionType.Literal,
    value: "foo/",
  }, {
    allowReserved: false,
    first: "",
    ifEmpty: "",
    named: false,
    separator: ",",
    terms: [
      {
        explode: false,
        name: "bar",
        truncate: 0,
      },
    ],
    type: ExpressionType.Variable,
  }, {
    value: "/baz",
    type: ExpressionType.Literal,
  }];

  assertEquals(parse("foo/{bar}/baz"), expected);
});

Deno.test("Should throw when a closing brace is found without an opening brace", () => {
  assertThrows(
    () => parse("}"),
    Error,
    "Unexpected char '}' at position 1 in '}', expected an opening brace before a closing brace.",
  );

  assertThrows(
    () => parse("foo}bar"),
    Error,
    "Unexpected char '}' at position 4 in 'foo}bar', expected an opening brace before a closing brace.",
  );
});

Deno.test("Should throw when an opening brace is found at the end", () => {
  assertThrows(
    () => parse("{"),
    Error,
    "Unexpected char '{' at position 1 in '{', expected a closing brace.",
  );

  assertThrows(
    () => parse("foo{"),
    Error,
    "Unexpected char '{' at position 4 in 'foo{', expected a closing brace.",
  );
});

Deno.test("Should throw when an opening brace is not closed", () => {
  assertThrows(
    () => parse("foo{bar"),
    Error,
    "Unexpected char 'r' at position 7 in 'foo{bar', expected a closing brace.",
  );

  assertThrows(
    () => parse("foo{bar{baz}"),
    Error,
    "Unexpected char '{' at position 8 in 'foo{bar{baz}', expected a closing brace.",
  );
});

Deno.test("Should throw when empty braces are found", () => {
  assertThrows(
    () => parse("{}"),
    Error,
    "Unexpected char '}' at position 2 in '{}', expected a pair of braces to have content.",
  );

  assertThrows(
    () => parse("foo/{}"),
    Error,
    "Unexpected char '}' at position 6 in 'foo/{}', expected a pair of braces to have content.",
  );
});
