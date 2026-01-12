export const PDF_TABLE_RAW_TEXT_TO_CHUNKS_PROMPT = `You are processing RAW TEXT extracted from a PAGES of a university PDF.

IMPORTANT:
- If the text DOES NOT contain a STRUCTURED TABLE with rows and columns → OUTPUT NOTHING.
- Do NOT explain.
- Do NOT summarize.
- Do NOT invent data.
- Do NOT output headers alone.
- Do NOT output text outside tables.
- Do NOT output section titles, faculty names, or descriptions.

ONLY extract data FROM TABLE ROWS if a table is clearly present.

────────────────────────
WHAT COUNTS AS A TABLE
────────────────────────
A table is present if:
- There is a header row (e.g. №, П.І.Б., Група, рейтинг, стипендія, примітка), AND
- Multiple data rows follow with repeating structure (row number, name, group, numeric values).

If this condition is NOT met → OUTPUT NOTHING.

────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────
Each TABLE ROW must be converted into exactly ONE LINE.

Line format:
key=value | key=value | key=value | ...

Rules:
- Use "|" (pipe) with single spaces around it to separate fields.
- Use "=" between key and value.
- Keys MUST be lowercase.
- Keys MUST come from table headers (normalized).
- Values MUST be taken EXACTLY from the table content.
- Preserve Ukrainian text exactly in VALUES.
- If a cell value is split across multiple lines → JOIN it correctly.
- If a cell is empty → OMIT that key entirely.
- DO NOT add keys that are not present in the table.
- Preserve the LEFT-TO-RIGHT column order as in the table.
- DO NOT merge rows.
- One output line = one table row.

────────────────────────
HEADER NORMALIZATION RULES
────────────────────────
- Convert header text to lowercase.
- Replace line breaks with single spaces.
- Collapse multiple spaces into one.
- Remove punctuation characters (.,-), but KEEP spaces.
- Do NOT translate.
- Do NOT map to English.

Examples:
- "П.І.Б." → "піб"
- "Група" → "група"
- "Заг.\\nрейтинг" → "заг рейтинг"
- "Розмір\\nстипендії,\\nгрн." → "розмір стипендії грн"
- "Примітка" → "примітка"

────────────────────────
ROW OUTPUT EXAMPLE
────────────────────────
№=1 | піб=Ілон М.Е. | група=КН-22-1 | середній бал успішності=99,71 | дод. бал=50 | заг. рейтинг=94,74 | мінімальний бал успішності=99

────────────────────────
FINAL RULES
────────────────────────
- If the text contains NO TABLE → OUTPUT NOTHING (empty response).
- If the text contains ONLY headings or descriptions → OUTPUT NOTHING.
- If rows are broken across multiple lines → reconstruct them into a single row.
- Output ONLY table row lines.
- Output plain text only, no explanations, no formatting.
`;
