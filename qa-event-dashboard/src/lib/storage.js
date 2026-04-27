const STORAGE_KEY = "qa_events";
const IGNORED_KEYS_KEY = "qa_ignored_keys";

export function loadEvents() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const DEFAULT_IGNORED_KEYS = ["seid", "timestamp", "event_timestamp", "event_id", "session_id"];

export function loadIgnoredKeys() {
  if (typeof window === "undefined") return DEFAULT_IGNORED_KEYS;
  try {
    const raw = localStorage.getItem(IGNORED_KEYS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_IGNORED_KEYS;
  } catch {
    return DEFAULT_IGNORED_KEYS;
  }
}

export function saveIgnoredKeys(keys) {
  if (typeof window === "undefined") return;
  localStorage.setItem(IGNORED_KEYS_KEY, JSON.stringify(keys));
}
