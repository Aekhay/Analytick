/**
 * Reorders `actual` keys to match the key order of `baseline`, recursively.
 * - Plain objects: keys are sorted to mirror baseline order; extra keys appended.
 * - Arrays: each element is recursively reordered against the corresponding
 *   baseline element (handles arrays of objects like eventAttributes.filters).
 * - Primitives / null / type mismatches: returned as-is.
 */
export function reorderToMatch(baseline, actual) {
  if (Array.isArray(baseline) && Array.isArray(actual)) {
    return actual.map((item, i) => reorderToMatch(baseline[i], item));
  }

  if (
    actual === null ||
    typeof actual !== "object" ||
    Array.isArray(actual) ||
    baseline === null ||
    typeof baseline !== "object" ||
    Array.isArray(baseline)
  ) {
    return actual;
  }

  const result = {};

  Object.keys(baseline).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(actual, key)) {
      result[key] = reorderToMatch(baseline[key], actual[key]);
    }
  });

  Object.keys(actual).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(baseline, key)) {
      result[key] = actual[key];
    }
  });

  return result;
}

/**
 * Safely parses a JSON string. Returns { data, error }.
 */
export function safeParse(str) {
  if (!str || !str.trim()) return { data: null, error: null };
  try {
    return { data: JSON.parse(str), error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

/**
 * Pretty-prints a JSON value with 2-space indentation.
 */
export function prettyPrint(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 * Generates a simple unique ID (UUID-like).
 */
export function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
