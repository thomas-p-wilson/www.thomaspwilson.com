/**
 * Useful for `JSON.stringify`'ing circular objects
 */
export const replacer = (omit_keys=[]) => {
  const seen = new WeakSet();
  return (key, value) => {
    if (omit_keys.includes(key)) {
      return '[omitted]';
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return '[circular]';
      }
      seen.add(value);
    }
    return value;
  };
};