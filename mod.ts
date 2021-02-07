import { pctEncode } from "./pct.ts";

export type Value =
  | Record<string, string>
  | null
  | string
  | string[];

export enum ExpressionType {
  Literal = "Literal",
  Variable = "Variable",
}

export interface LiteralExpression {
  type: ExpressionType.Literal;
  value: string;
}

export interface Term {
  explode: boolean;
  name: string;
  truncate: number;
}

export type IfEmpty = "" | "=";

export type First = "" | "." | ";" | "/" | "?" | "&" | "#";

export type Separator = "," | "." | "/" | ";" | "&";

export interface VariableExpression {
  allowReserved: boolean;
  first: First;
  ifEmpty: string;
  named: boolean;
  separator: Separator;
  terms: Term[];
  type: ExpressionType.Variable;
}

export type Expression = LiteralExpression | VariableExpression;

export type Operator = "+" | "#" | "." | "/" | ";" | "?" | "&";

function isOperator(char: string): char is Operator {
  return ["+", "#", ".", "/", ";", "?", "&"].includes(char as Operator);
}

function defaultTerm(): Term {
  return {
    explode: false,
    name: "",
    truncate: 0,
  };
}

function parseTerm(raw: string): Term {
  const term = defaultTerm();

  if (raw.endsWith("*")) {
    term.explode = true;
    raw = raw.substr(0, raw.length - 1);
  }

  const split = raw.split(":");

  switch (split.length) {
    case 1: {
      term.name = split[0];
      break;
    }
    case 2: {
      term.name = split[0];
      term.truncate = parseInt(split[1], 10);
      break;
    }
    default: {
      throw new Error("ParseError");
    }
  }

  if (term.explode && term.truncate) {
    throw new Error("ParseError");
  }

  return term;
}

function defaultVariableExpression(): VariableExpression {
  return {
    allowReserved: false,
    first: "",
    ifEmpty: "",
    named: false,
    separator: ",",
    terms: [],
    type: ExpressionType.Variable,
  };
}

function parseExpression(raw: string): VariableExpression {
  const firstChar = raw.charAt(0);
  const operator: Operator | null = isOperator(firstChar) ? firstChar : null;
  const expression = defaultVariableExpression();

  expression.terms = raw
    .substr(operator?.length || 0)
    .split(",")
    .map(parseTerm);

  switch (operator) {
    case "+": {
      expression.allowReserved = true;
      break;
    }
    case ".": {
      expression.first = ".";
      expression.separator = ".";
      break;
    }
    case "/": {
      expression.first = "/";
      expression.separator = "/";
      break;
    }
    case ";": {
      expression.first = ";";
      expression.named = true;
      expression.separator = ";";
      break;
    }
    case "?": {
      expression.first = "?";
      expression.ifEmpty = "=";
      expression.named = true;
      expression.separator = "&";
      break;
    }
    case "&": {
      expression.first = "&";
      expression.ifEmpty = "=";
      expression.named = true;
      expression.separator = "&";
      break;
    }
    case "#": {
      expression.allowReserved = true;
      expression.first = "#";
      expression.separator = ",";
      break;
    }
  }

  return expression;
}

export interface Cursor {
  over: ExpressionType;
  pos: number;
}

function parse(template: string): Expression[] {
  const expressions: Expression[] = [];

  let cursor: Cursor = {
    over: ExpressionType.Literal,
    pos: 0,
  };

  const { length } = template;

  for (let index = 0; index < template.length; index++) {
    const char = template.charAt(index);

    if (length === index + 1 /* last char */) {
      if (
        char === "{" ||
        cursor.over === ExpressionType.Variable && char !== "}"
      ) {
        throw new Error("ParseError");
      }
      if (cursor.over === ExpressionType.Literal) {
        expressions.push({
          type: ExpressionType.Literal,
          // push the rest of the template as a literal
          value: template.substr(cursor.pos),
        });
      }
    }

    if (
      cursor.over === ExpressionType.Literal && char === "}" ||
      cursor.over === ExpressionType.Variable && char === "{"
    ) {
      throw new Error("ParseError");
    }

    if (cursor.over === ExpressionType.Literal && char === "{") {
      if (index > cursor.pos) {
        expressions.push({
          type: ExpressionType.Literal,
          value: template.substr(cursor.pos, index - cursor.pos),
        });
      }

      // move cursor to the starting brace of the variable
      cursor = {
        over: ExpressionType.Variable,
        pos: index,
      };

      continue;
    }

    if (cursor.over === ExpressionType.Variable && char === "}") {
      if (index === cursor.pos + 1) {
        // braces are empty
        throw new Error("ParseError");
      }

      const from = cursor.pos + 1;
      const length = index - cursor.pos - 1;

      const expression = parseExpression(
        template.substr(from, length),
      );

      expressions.push(expression);

      cursor = {
        over: ExpressionType.Literal,
        pos: index + 1,
      };
    }
  }

  return expressions;
}

const isEmptyString = (str: string) =>
  typeof str === "undefined" || str === null || str === "";

export interface ExpandNameOptions {
  ifEmpty: string;
  name: string;
  named: boolean;
}

function expandName(
  input: string,
  {
    ifEmpty,
    name,
    named,
  }: ExpandNameOptions,
): string {
  if (named && isEmptyString(input)) {
    return `${name}${ifEmpty}`;
  }

  if (named) {
    return `${name}=${input}`;
  }

  return input;
}

export interface ExpandStringOptions {
  allowReserved: boolean;
  ifEmpty: string;
  name: string;
  named: boolean;
  truncate: number;
}

function expandString(input: string, {
  allowReserved,
  ifEmpty,
  name,
  named,
  truncate,
}: ExpandStringOptions): string {
  let output = input;

  if (truncate > 0 && input.length > truncate) {
    output = output.substr(0, truncate);
  }

  output = pctEncode(output, { allowReserved });
  output = expandName(output, { ifEmpty, name, named });

  return output;
}

export interface ExpandArrayOptions {
  allowReserved: boolean;
  explode: boolean;
  ifEmpty: string;
  name: string;
  named: boolean;
  separator: Separator;
  truncate: number;
}

function expandArray(input: string[], {
  allowReserved,
  explode,
  ifEmpty,
  name,
  named,
  separator,
  truncate,
}: ExpandArrayOptions): string {
  const output = input
    .map((entry) => {
      if (explode) {
        return expandString(entry, {
          allowReserved,
          ifEmpty,
          name,
          named,
          truncate,
        });
      }

      let outputEntry = entry;

      if (truncate > 0 && output.length > truncate) {
        outputEntry = outputEntry.substr(0, truncate);
      }

      return pctEncode(outputEntry, { allowReserved });
    })
    .join(explode && separator || ",");

  if (!explode) {
    return expandName(output, { ifEmpty, name, named });
  }

  return output;
}

export interface ExpandObjectOptions {
  allowReserved: boolean;
  explode: boolean;
  ifEmpty: string;
  name: string;
  named: boolean;
  separator: Separator;
  truncate: number;
}

function expandObject(
  input: Record<string, string>,
  {
    allowReserved,
    explode,
    ifEmpty,
    name,
    named,
    separator,
    truncate,
  }: ExpandObjectOptions,
): string {
  const output = Object.entries(input)
    .map(([key, value]) => {
      if (explode) {
        return expandString(value, {
          allowReserved,
          ifEmpty,
          name: key,
          named: true,
          truncate,
        });
      }

      return [key, pctEncode(value, { allowReserved })].join(",");
    })
    .join(explode && separator || ",");

  if (!explode) {
    return expandName(output, { ifEmpty, name, named });
  }

  return output;
}

function expandExpression(
  expression: Expression,
  variables: Record<string, Value>,
) {
  if (expression.type === ExpressionType.Literal) {
    return expression.value;
  }

  const {
    allowReserved,
    first,
    ifEmpty,
    named,
    separator,
    terms,
  } = expression;

  const fragments = terms
    .reduce((result: string[], { explode, name, truncate }) => {
      const value = variables[name];

      if (typeof value === "undefined" || value === null) {
        return result;
      }

      if (typeof value === "string") {
        return [
          ...result,
          expandString(value, {
            allowReserved,
            ifEmpty,
            name,
            named,
            truncate,
          }),
        ];
      }

      if (Array.isArray(value)) {
        if (value.length <= 0) {
          return result;
        }

        return [
          ...result,
          expandArray(value, {
            allowReserved,
            explode,
            ifEmpty,
            name,
            named,
            separator,
            truncate,
          }),
        ];
      }

      return [
        ...result,
        expandObject(value, {
          explode,
          separator,
          allowReserved,
          truncate,
          ifEmpty,
          name,
          named,
        }),
      ];
    }, []);

  if (fragments.length === 0) {
    return "";
  }

  return `${first}${fragments.join(separator)}`;
}

function expand(
  template: string,
  variables: Record<string, Value>,
): string {
  return parse(template)
    .map((expression) => expandExpression(expression, variables))
    .join("");
}

export {
  expand,
  expandArray,
  expandExpression,
  expandName,
  expandObject,
  expandString,
  parse,
  parseExpression,
  parseTerm,
};
