export type ExtractEnumValues<T extends string> = {
  [K in Uppercase<T>]: Lowercase<K>;
};
