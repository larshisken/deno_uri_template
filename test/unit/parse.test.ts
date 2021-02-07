import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.84.0/testing/asserts.ts";

import { Expression, ExpressionType, parse } from "../../mod.ts";

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
  assertThrows(() => parse("}"), Error, "ParseError");
  assertThrows(() => parse("foo}bar"), Error, "ParseError");
});

Deno.test("Should throw when an opening brace is found at the end", () => {
  assertThrows(() => parse("{"), Error, "ParseError");
  assertThrows(() => parse("foo{"), Error, "ParseError");
});

Deno.test("Should throw when an opening brace is not closed", () => {
  assertThrows(() => parse("foo{bar"), Error, "ParseError");
  assertThrows(() => parse("foo{bar{baz}"), Error, "ParseError");
});

Deno.test("Should throw when empty braces are found", () => {
  assertThrows(() => parse("{}"), Error, "ParseError");
  assertThrows(() => parse("foo/{}"), Error, "ParseError");
});
