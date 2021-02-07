const RESERVED = [
  ":",
  "/",
  "?",
  "#",
  "[",
  "]",
  "@",
  "!",
  "$",
  "&",
  "(",
  ")",
  "*",
  "+",
  ",",
  ";",
  "=",
  "'",
];

function isAlpha(char: string): boolean {
  return (char >= "a" && char <= "z") || ((char >= "A" && char <= "Z"));
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function pctEncodeChar(char: string) {
  const charCode = char.charCodeAt(0);
  const encoded: number[] = [];

  if (charCode < 128) {
    encoded.push(charCode);
  } else if ((128 <= charCode && charCode < 2048)) {
    encoded.push((charCode >> 6) | 192);
    encoded.push((charCode & 63) | 128);
  } else {
    encoded.push((charCode >> 12) | 224);
    encoded.push(((charCode >> 6) & 63) | 128);
    encoded.push((charCode & 63) | 128);
  }

  return encoded.map((char) => `%${char.toString(16).toUpperCase()}`).join("");
}

export interface PctEncodeOptions {
  allowReserved: boolean;
}

function pctEncode(
  input: string,
  { allowReserved }: PctEncodeOptions,
): string {
  const {
    prototype: {
      map,
    },
  } = Array;

  return map.call(input, (char: string): string => {
    if (
      isAlpha(char) ||
      isDigit(char) ||
      ["-", ".", "_", "~"].includes(char) ||
      allowReserved && RESERVED.includes(char)
    ) {
      return char;
    }

    return pctEncodeChar(char);
  }).join("");
}

export { pctEncode, pctEncodeChar };
