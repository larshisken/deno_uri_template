import { Value } from "../../mod.ts";

export type Expected = string | string[];

export interface Example {
  level?: number;
  testcases: [string, Expected][];
  variables: Record<string, Value>;
}

export type DoTestCallback = (args: {
  testcase: [string, Expected];
  variables: Record<string, Value>;
}) => void;

function doTest(examples: Record<string, Example>, f: DoTestCallback) {
  Object.entries(examples).forEach(([section, example]) => {
    const { testcases, variables } = example;

    testcases.forEach((testcase) => {
      const [input, output] = testcase;

      Deno.test(`${section}: ${input} -> ${output}`, () =>
        f({ testcase, variables }));
    });
  });
}

export { doTest };
