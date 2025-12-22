export const GREETINGS_MESSAGE = `👋 Привіт!

Я — AI-помічник університету 🤖
Допомагаю швидко знаходити інформацію про розклад, іспити, дедлайни, новини та документи — просто у звичайному чаті.

Щоб я міг давати персональні відповіді саме для тебе, напиши, будь ласка, про себе:

1. Прізвище та Імʼя
2. Групу

Можна в будь-якому форматі 🙂
Наприклад: Ілон Маск, КН-22-1`;

export const ONBOARDING_FAILURE_MESSAGE =
  'Не вдалося перевірити надану інформацію. Будь ласка, перевірте дані та спробуйте пізніше або зверніться до адміністрації.';

export const USER_MESSAGE_PLACEHOLDER = '{{userMessage}}';

export const ONBOARDING_VALIDATION_PROMPT = `SYSTEM:
You extract onboarding data for a Ukrainian university Telegram bot.
Return ONLY valid JSON. No explanations.

USER:
Extract full name and group from this message.
Do not invent data. If anything is missing or unclear, set needsRetry=true.

Message:
${USER_MESSAGE_PLACEHOLDER}

Output JSON schema:
{
  "needsRetry": boolean,
  "fullName": string | null,
  "group": string | null,
  "retryMessage": string | null
}

Rules:
- fullName:
  - must be the exact text fragment that looks like a person's name (at least 2 words).
  - if only one name word or unclear → needsRetry=true.

- group:
  - extract group identifiers like: ІСТ-21-1, КН-31-1, IPZ21 2, KN 31 2.
  - group must include an index (e.g. "-1", "-2").
  - normalize to format: LETTERS-DIGITS-DIGITS using hyphens (e.g. "КН-31-1").
  - if multiple or no groups found → needsRetry=true.
  - if group without index (e.g. "ІСТ-21") → needsRetry=true.

- If needsRetry=true, set retryMessage to:

"Щоб я міг давати персональні відповіді саме для тебе, напиши, будь ласка:
1) Прізвище та імʼя
2) Групу
Наприклад: Ілон Маск, КН-22-1"

- If needsRetry=false, retryMessage must be null.`;

export const ONBOARDING_SUCCESS = `Дякую! ✅
Я зберіг твої дані.

Тепер можеш просто писати запити у вільній формі 🙂
Наприклад:
• «Покажи мій розклад на завтра»
• «Коли наступний іспит?»
• «Які новини за сьогодні?»`;

export const MISSING_RETRY_MESSAGE = '<Missing retry message>';
