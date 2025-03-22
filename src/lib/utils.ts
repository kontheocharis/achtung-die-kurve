export function assert(
  condition: boolean,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function todo(message?: string): never {
  throw new Error(message || "Not implemented");
}

export function fromEntries<K extends string | number | symbol, V>(
  entries: Iterable<[K, V]>,
): Record<K, V> {
  const result: Record<K, V> = {} as Record<K, V>;
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}
