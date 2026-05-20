const STORAGE_KEY = "qa_events";
const IGNORED_KEYS_KEY = "qa_ignored_keys";
const GITHUB_TOKEN_KEY = "qa_github_token";
const GIST_ID_KEY = "qa_gist_id";

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

export function loadGithubToken() {
  if (typeof window === "undefined") return null;
  try {
    // sessionStorage keeps the token alive only for the current browser session.
    // Falls back to localStorage to avoid breaking existing connected sessions after upgrade.
    return sessionStorage.getItem(GITHUB_TOKEN_KEY)
      ?? localStorage.getItem(GITHUB_TOKEN_KEY)
      ?? null;
  }
  catch { return null; }
}

export function saveGithubToken(token) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GITHUB_TOKEN_KEY, token);
  // Remove any legacy copy from localStorage so the PAT is no longer persisted long-term.
  try { localStorage.removeItem(GITHUB_TOKEN_KEY); } catch { /* ignore */ }
}

export function loadGistId() {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(GIST_ID_KEY) ?? null; }
  catch { return null; }
}

export function saveGistId(id) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GIST_ID_KEY, id);
}

export function clearGithubSync() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GITHUB_TOKEN_KEY);
  localStorage.removeItem(GITHUB_TOKEN_KEY);
  localStorage.removeItem(GIST_ID_KEY);
}
