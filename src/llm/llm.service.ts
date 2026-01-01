import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class LlmService {
  private readonly client = new OpenAI();

  async generate(prompt: string) {
    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: prompt,
    });

    return response.output_text;
  }

  async preparePdfTableImagesForChunking(images: string[]) {
    const prompt = `
You are processing a PAGE IMAGE from a university PDF.

IMPORTANT:
- If the image DOES NOT contain a STRUCTURED TABLE with rows and columns → OUTPUT NOTHING.
- Do NOT explain.
- Do NOT summarize.
- Do NOT invent data.
- Do NOT output headers alone.
- Do NOT output text outside tables.

ONLY extract data FROM TABLE ROWS if a table is clearly present.

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
- Keys MUST come from table headers (normalized: lowercase, no punctuation).
- Values MUST be taken EXACTLY from the table cells.
- Preserve Ukrainian text exactly in VALUES.
- If a cell is empty → OMIT that key entirely.
- DO NOT add keys that are not present in the table.
- Preserve the LEFT-TO-RIGHT column order exactly as shown in the table.
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
- Examples:
  "ПІБ" → "піб"
  "Група" → "група"
  "Середній\\nбал\\nуспішнос\\nті" → "середній бал успішності"
  "Дод. бал" → "дод. бал"
  "Заг. рейтинг" → "заг. рейтинг"
  "Мінімальний бал успішності" → "мінімальний бал успішності"

────────────────────────
ROW OUTPUT EXAMPLE
────────────────────────
№=1 | піб=Ілон М.Е. | група=КН-22-1 | середній бал успішності=99,71 | дод. бал=50 | заг. рейтинг=94,74 | мінімальний бал успішності=99

────────────────────────
FINAL RULES
────────────────────────
- If the image contains NO TABLE → OUTPUT NOTHING (empty response).
- If the image contains TEXT ONLY → OUTPUT NOTHING.
- If the image contains DIAGRAMS / CALENDAR GRIDS without clear rows → OUTPUT NOTHING.
- Output ONLY table row lines, nothing else.
`;

    const inputImages = images.map((img) => ({
      type: 'input_image' as const,
      image_url: `data:image/png;base64,${img}`,
      detail: 'auto' as const,
    }));

    const response = await this.client.responses.create({
      model: 'gpt-5-nano',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt.trim(),
            },
            ...inputImages,
          ],
        },
      ],
    });

    return response.output_text;
  }
}
