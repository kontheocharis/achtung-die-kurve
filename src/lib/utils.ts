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

export type Memo<T> = {
  cached: T | null;
  compute: () => T;
};

export function getMemo<T>(m: Memo<T>): T {
  if (m.cached === null) {
    m.cached = m.compute();
  }
  return m.cached;
}

export function memo<T>(compute: () => T): Memo<T> {
  return {
    cached: null,
    compute,
  };
}

export function clearKeys<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
) {
  Object.keys(obj).forEach((key) => delete obj[key]);
}
