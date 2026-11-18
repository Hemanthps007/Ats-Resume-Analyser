import zlib from "zlib";

/**
 * Pure TypeScript PDF Text Extractor
 * Zero external dependencies. Uses standard Node.js zlib to decode FlateDecode and ASCII85 streams.
 */

// Decode ASCII85 / btoa stream
function decodeAscii85(str: string): Buffer {
  let cleaned = str.replace(/\s+/g, "");
  if (cleaned.startsWith("<~")) cleaned = cleaned.slice(2);
  if (cleaned.endsWith("~>")) cleaned = cleaned.slice(0, -2);

  const out: number[] = [];
  let tuple = 0;
  let count = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned.charCodeAt(i);
    if (ch === 122 && count === 0) {
      // 'z' stands for 5 zero bytes
      out.push(0, 0, 0, 0);
      continue;
    }
    if (ch >= 33 && ch <= 117) {
      // '!' to 'u'
      tuple = tuple * 85 + (ch - 33);
      count++;
      if (count === 5) {
        out.push(
          (tuple >>> 24) & 0xff,
          (tuple >>> 16) & 0xff,
          (tuple >>> 8) & 0xff,
          tuple & 0xff
        );
        tuple = 0;
        count = 0;
      }
    }
  }

  if (count > 0) {
    for (let i = count; i < 5; i++) {
      tuple = tuple * 85 + 84;
    }
    for (let i = 0; i < count - 1; i++) {
      out.push((tuple >>> (24 - i * 8)) & 0xff);
    }
  }

  return Buffer.from(out);
}

// Decode PDF string literals (unescape \n, \r, \t, \(, \), \\, \ddd octal)
function unescapePdfString(str: string): string {
  return str.replace(/\\([0-7]{1,3}|[nrtbf()\\])/g, (_, match) => {
    switch (match) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "(": return "(";
      case ")": return ")";
      case "\\": return "\\";
      default:
        // octal character
        if (/^[0-7]{1,3}$/.test(match)) {
          return String.fromCharCode(parseInt(match, 8));
        }
        return match;
    }
  });
}

// Parse text chunks from a decompressed PDF content stream
function extractTextFromContentStream(streamContent: string): string[] {
  const lines: string[] = [];

  // Match text blocks: BT ... ET
  const btRegex = /BT([\s\S]*?)ET/g;
  let btMatch: RegExpExecArray | null;

  while ((btMatch = btRegex.exec(streamContent)) !== null) {
    const block = btMatch[1];

    // 1. Array of text strings: [(Accomplished) -12 (X) -10 (by)] TJ
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let tjArrMatch: RegExpExecArray | null;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = tjArrMatch[1];
      let lineParts = "";
      const itemRegex = /\((.*?)\)|(-?\d+(?:\.\d+)?)/g;
      let item: RegExpExecArray | null;
      while ((item = itemRegex.exec(inner)) !== null) {
        if (item[1] !== undefined) {
          lineParts += unescapePdfString(item[1]);
        } else if (item[2] !== undefined) {
          const spacing = parseFloat(item[2]);
          // Negative spacing < -100 typically represents a space between words in PDF
          if (spacing < -120) {
            lineParts += " ";
          }
        }
      }
      const trimmed = lineParts.trim();
      if (trimmed) lines.push(trimmed);
    }

    // 2. Single text strings: (Hello World) Tj, or ' / " operators
    const tjRegex = /\((.*?)\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const text = unescapePdfString(tjMatch[1]).trim();
      if (text) lines.push(text);
    }

    // 3. Hex-encoded strings: <48656c6c6f> Tj
    const hexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g;
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexRegex.exec(block)) !== null) {
      const hex = hexMatch[1];
      let text = "";
      for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16);
        if (charCode >= 32 && charCode <= 126) {
          text += String.fromCharCode(charCode);
        }
      }
      const trimmed = text.trim();
      if (trimmed) lines.push(trimmed);
    }
  }

  return lines;
}

/**
 * Extracts plain text from a raw PDF Buffer
 */
export function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const rawContent = buffer.toString("binary");
    const extractedLines: string[] = [];

    // Find all stream blocks in PDF
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(rawContent)) !== null) {
      const streamBytes = Buffer.from(match[1], "binary");

      // Check stream dictionary right before the stream keyword
      const preStreamContext = rawContent.slice(Math.max(0, match.index - 300), match.index);
      const isAscii85 = preStreamContext.includes("/ASCII85Decode");

      let decodedBuffer: Buffer = streamBytes;
      if (isAscii85) {
        try {
          decodedBuffer = decodeAscii85(streamBytes.toString("ascii"));
        } catch {
          decodedBuffer = streamBytes;
        }
      }

      // Attempt Flate decompression
      let decompressedText = "";
      try {
        decompressedText = zlib.inflateSync(decodedBuffer).toString("utf-8");
      } catch {
        try {
          decompressedText = zlib.inflateRawSync(decodedBuffer).toString("utf-8");
        } catch {
          try {
            decompressedText = decodedBuffer.toString("utf-8");
          } catch {
            decompressedText = "";
          }
        }
      }

      if (decompressedText) {
        const lines = extractTextFromContentStream(decompressedText);
        if (lines.length > 0) {
          extractedLines.push(...lines);
        }
      }
    }

    // If stream parsing extracted text, return it
    if (extractedLines.length > 0) {
      return extractedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    }

    // Fallback: search for plaintext strings in buffer
    const textMatches = rawContent.match(/\(([^()]{3,})\)\s*Tj/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches
        .map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, "").trim())
        .filter(Boolean)
        .join("\n");
    }

    return "";
  } catch (err) {
    console.error("PDF buffer parsing error:", err);
    return "";
  }
}
