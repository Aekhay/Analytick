const GIST_DESCRIPTION = "QA Event Dashboard";
const EVENTS_FILE = "qa-dashboard-events.json";
const IGNORED_KEYS_FILE = "qa-dashboard-ignored-keys.json";

async function api(method, path, token, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error ${res.status}`);
  }

  return res.json();
}

/**
 * Searches the user's first 100 gists for an existing QA Dashboard gist.
 * If found, returns its ID. If not, creates a new private gist with the
 * current events/ignoredKeys and returns the new ID.
 */
export async function findOrCreateGist(token, events, ignoredKeys) {
  const gists = await api("GET", "/gists?per_page=100", token);
  const existing = gists.find((g) => g.description === GIST_DESCRIPTION);
  if (existing) return existing.id;

  const created = await api("POST", "/gists", token, {
    description: GIST_DESCRIPTION,
    public: false,
    files: {
      [EVENTS_FILE]: { content: JSON.stringify(events, null, 2) },
      [IGNORED_KEYS_FILE]: { content: JSON.stringify(ignoredKeys, null, 2) },
    },
  });

  return created.id;
}

/**
 * Reads events and ignoredKeys from an existing Gist.
 * Returns null fields if the corresponding files don't exist yet.
 */
export async function readGist(token, gistId) {
  const gist = await api("GET", `/gists/${gistId}`, token);

  const events = gist.files[EVENTS_FILE]
    ? JSON.parse(gist.files[EVENTS_FILE].content)
    : null;

  const ignoredKeys = gist.files[IGNORED_KEYS_FILE]
    ? JSON.parse(gist.files[IGNORED_KEYS_FILE].content)
    : null;

  return { events, ignoredKeys };
}

/**
 * Overwrites the events and ignoredKeys files in an existing Gist.
 */
export async function writeGist(token, gistId, events, ignoredKeys) {
  await api("PATCH", `/gists/${gistId}`, token, {
    files: {
      [EVENTS_FILE]: { content: JSON.stringify(events, null, 2) },
      [IGNORED_KEYS_FILE]: { content: JSON.stringify(ignoredKeys, null, 2) },
    },
  });
}
