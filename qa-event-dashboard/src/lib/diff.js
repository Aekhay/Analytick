import isEqual from "lodash/isEqual";

/**
 * Returns true if a dot-notation path should be skipped.
 * Matches on the leaf key name (e.g. "seid" matches "metadata.seid") OR
 * on a full dot-path (e.g. "metadata.seid" matches exactly).
 */
function isIgnored(path, ignoredKeys) {
  if (!ignoredKeys || ignoredKeys.length === 0) return false;
  const leafKey = path.split(".").pop();
  return ignoredKeys.some((k) => k === path || k === leafKey);
}

/**
 * Recursively collects all leaf-level dot-notation paths from an object.
 * Arrays are treated as atomic values — their internal items are not expanded.
 */
function collectPaths(obj, prefix = "", ignoredKeys = []) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [{ path: prefix, value: obj }];
  }

  return Object.keys(obj).flatMap((key) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (isIgnored(fullPath, ignoredKeys)) return [];
    const val = obj[key];

    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      return collectPaths(val, fullPath, ignoredKeys);
    }
    return [{ path: fullPath, value: val }];
  });
}

/**
 * Gets a nested value from an object using a dot-notation path.
 */
function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, obj);
}

/**
 * Compares two JSON payloads deeply and order-agnostically.
 * ignoredKeys: string[] — leaf key names or full dot-paths to skip entirely.
 *
 * Returns:
 *   isEqual        — true if payloads are semantically identical (after ignoring)
 *   missingKeys    — dot-paths in baseline absent from actual
 *   addedKeys      — dot-paths in actual absent from baseline
 *   changedValues  — dot-paths where values differ { key, baselineValue, actualValue }
 *   ignoredCount   — number of paths skipped
 *   summary        — { total, passed, failed, ignored }
 */
export function comparePayloads(baseline, actual, ignoredKeys = []) {
  const baselinePaths = collectPaths(baseline, "", ignoredKeys);
  const actualPaths = collectPaths(actual, "", ignoredKeys);

  const baselinePathSet = new Set(baselinePaths.map((p) => p.path));
  const actualPathSet = new Set(actualPaths.map((p) => p.path));

  const missingKeys = baselinePaths
    .filter((p) => !actualPathSet.has(p.path))
    .map((p) => p.path);

  const addedKeys = actualPaths
    .filter((p) => !baselinePathSet.has(p.path))
    .map((p) => p.path);

  const changedValues = baselinePaths
    .filter((p) => actualPathSet.has(p.path))
    .filter((p) => !isEqual(p.value, getByPath(actual, p.path)))
    .map((p) => ({
      key: p.path,
      baselineValue: p.value,
      actualValue: getByPath(actual, p.path),
    }));

  const allBaselinePaths = collectPaths(baseline, "", []);
  const ignoredCount = allBaselinePaths.filter((p) =>
    isIgnored(p.path, ignoredKeys)
  ).length;

  const total = baselinePaths.length;
  const failed = missingKeys.length + changedValues.length;
  const passed = total - failed;
  const allEqual = failed === 0 && addedKeys.length === 0;

  return {
    isEqual: allEqual,
    missingKeys,
    addedKeys,
    changedValues,
    ignoredCount,
    summary: { total, passed, failed, ignored: ignoredCount },
  };
}

/**
 * Returns a map of every dot-path segment (root → leaf) that has a diff
 * annotation — used by the JSON renderer to highlight all ancestor lines
 * leading to a changed/missing/added leaf, not just the root and leaf.
 *
 * Priority order: missing > added > changed.
 * A parent shared by multiple diff types keeps the highest-priority type.
 */
export function buildDiffMap(diffResult) {
  const map = {};

  const markSegments = (path, type) => {
    const parts = path.split(".");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}.${part}` : part;
      if (!map[current]) map[current] = type;
    }
    map[path] = type;
  };

  diffResult.missingKeys.forEach((k) => markSegments(k, "missing"));
  diffResult.addedKeys.forEach((k) => markSegments(k, "added"));
  diffResult.changedValues.forEach(({ key }) => markSegments(key, "changed"));

  return map;
}
