# Deno URI Template 

A Typescript implementation of URI Template ([RFC6570](https://tools.ietf.org/html/rfc6570)).

## Usage

```typescript
import { expand } from "https://deno.land/x/deno_uri_template/mod.ts";

expand("{hello}", { hello: "Hello World!" })
// "Hello%20World%21"

expand("{hello:6}", { hello: "Hello World!" })
// "Hello%20"

expand("{/path*}", { path: ["person", "albums" })
// "/person/albums"

expand("{?filter*}", { filter: { firstName: "john", lastName: "doe" } })
// "?firstName=john&lastName=doe"
```

## Tests

```bash
$ git clone --recurse-submodules https://github.com/larshisken/deno_uri_template
$ deno test --allow-read
```
