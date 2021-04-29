import { assert, assertEquals } from "../../deps.ts";
import { expand } from "../../mod.ts";
import { doTest, Example } from "./helper.ts";

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
    typeof y === "string" ? assertEquals(expand(x, variables), y) : assert(
      y.includes(
        expand(x, variables),
      ),
    ),
);
