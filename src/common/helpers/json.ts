export const safeParseJSON = <T = unknown>(text?: string | null): T | null => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};
