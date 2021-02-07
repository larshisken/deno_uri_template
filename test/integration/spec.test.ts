import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.84.0/testing/asserts.ts";

import { doTest, Example } from "./helper.ts";
import { expand } from "../../mod.ts";

const [x, y] = await Promise.all([
  Deno.readTextFile("./uritemplate-test/spec-examples.json"),
  Deno.readTextFile("./uritemplate-test/spec-examples-by-section.json"),
]);

const examples: Record<string, Example> = {
  ...JSON.parse(x),
  ...JSON.parse(y),
};

doTest(
  examples,
  ({ testcase: [x, y], variables }) =>
    typeof y === "string"
      ? assertEquals(expand(x, variables), y)
      : assert(y.includes(expand(x, variables))),
);
