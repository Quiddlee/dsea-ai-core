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

type Replacer = Parameters<typeof JSON.stringify>['1'];
type Space = Parameters<typeof JSON.stringify>['2'];

export function stringifyJSONSafe(
  data: unknown,
  replacer?: Replacer,
  space?: Space,
) {
  return typeof data === 'string'
    ? data
    : JSON.stringify(data, replacer, space);
}
