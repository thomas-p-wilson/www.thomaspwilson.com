import { useEffect, useState } from "react";

/** useState that survives reloads. Falls back to `initial` if storage is missing, blocked or holds bad JSON. */
export function useLocalStorageState<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : { ...initial, ...JSON.parse(raw) };
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private mode or quota exceeded: the page still works, it just won't remember.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
