import { assertEquals } from "https://deno.land/std@0.84.0/testing/asserts.ts";

import { pctEncode, pctEncodeChar } from "../../pct.ts";

Deno.test("Should encode individual characters", () => {
  assertEquals(pctEncodeChar("b"), "%62");
  assertEquals(pctEncodeChar("a"), "%61");
  assertEquals(pctEncodeChar("r"), "%72");
  assertEquals(pctEncodeChar("!"), "%21");
});

Deno.test("Should encode a string", () => {
  assertEquals(
    pctEncode("foo bar baz", { allowReserved: false }),
    "foo%20bar%20baz",
  );

  assertEquals(
    pctEncode("foo.bar baz!", { allowReserved: true }),
    "foo.bar%20baz!",
  );
});
