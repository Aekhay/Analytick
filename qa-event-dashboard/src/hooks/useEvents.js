"use client";

import { useReducer, useEffect, useRef } from "react";
import {
  loadEvents, saveEvents,
  loadIgnoredKeys, saveIgnoredKeys,
  loadGithubToken, saveGithubToken,
  loadGistId, saveGistId, clearGithubSync,
} from "@/lib/storage";
import { findOrCreateGist, readGist, writeGist } from "@/lib/github";
import { generateId } from "@/lib/helpers";

const SEED_EVENTS = [
  {
    id: generateId(),
    name: "hp_click",
    platform: "firebase",
    description: "Homepage hero banner click event",
    payload: {
      event_name: "hp_click",
      timestamp: 1700000000,
      user_id: "u_123",
      params: { screen: "home", element: "hero_banner", x: 120, y: 340 },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "purchase_complete",
    platform: "kinesis",
    description: "Successful in-app purchase event",
    payload: {
      event: "purchase_complete",
      userId: "u_456",
      sessionId: "s_789",
      product: { id: "prod_001", name: "Pro Plan", price: 99.99, currency: "USD" },
      metadata: { source: "organic", campaign: null },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "feature_gate_viewed",
    platform: "statsig",
    description: "Feature gate evaluation event",
    payload: {
      eventName: "feature_gate_viewed",
      user: { userID: "u_789", email: "test@example.com" },
      gate: "new_checkout_flow",
      value: true,
      ruleID: "5jXk2",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialState = {
  events: [],
  selectedEventId: null,
  actualPayload: "",
  reorderActive: false,
  platformFilter: "all",
  ignoredKeys: [],
  githubToken: null,
  gistId: null,
  // 'idle' | 'connecting' | 'syncing' | 'synced' | 'error'
  syncStatus: "idle",
  syncError: null,
};

function reducer(state, update) {
  return { ...state, ...update };
}

export function useEvents() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Refs so async callbacks always see the latest values without stale closures.
  const tokenRef = useRef(null);
  const gistIdRef = useRef(null);
  const syncTimerRef = useRef(null);

  tokenRef.current = state.githubToken;
  gistIdRef.current = state.gistId;

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = loadGithubToken();
    const gistId = loadGistId();
    const storedIgnored = loadIgnoredKeys();

    const fallbackToLocal = () => {
      const stored = loadEvents();
      const events = stored.length > 0 ? stored : SEED_EVENTS;
      if (stored.length === 0) saveEvents(SEED_EVENTS);
      dispatch({ events, ignoredKeys: storedIgnored });
    };

    if (token && gistId) {
      dispatch({ githubToken: token, gistId, syncStatus: "syncing" });
      readGist(token, gistId)
        .then(({ events, ignoredKeys }) => {
          dispatch({
            events: events ?? loadEvents(),
            ignoredKeys: ignoredKeys ?? storedIgnored,
            syncStatus: "synced",
          });
        })
        .catch(() => {
          fallbackToLocal();
          dispatch({ syncStatus: "error", syncError: "Failed to load from GitHub. Using local data." });
        });
    } else if (token) {
      dispatch({ githubToken: token, syncStatus: "connecting" });
      const stored = loadEvents();
      const events = stored.length > 0 ? stored : SEED_EVENTS;
      findOrCreateGist(token, events, storedIgnored)
        .then((id) => {
          saveGistId(id);
          dispatch({ gistId: id, events, ignoredKeys: storedIgnored, syncStatus: "synced" });
        })
        .catch(() => {
          dispatch({ events, ignoredKeys: storedIgnored, syncStatus: "error", syncError: "GitHub connection failed." });
        });
    } else {
      fallbackToLocal();
    }
  }, []);

  // ── Debounced Gist write (for ignoredKeys changes) ──────────────────────
  const scheduleSync = (events, ignoredKeys) => {
    if (!tokenRef.current || !gistIdRef.current) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    dispatch({ syncStatus: "syncing" });
    syncTimerRef.current = setTimeout(() => {
      writeGist(tokenRef.current, gistIdRef.current, events, ignoredKeys)
        .then(() => dispatch({ syncStatus: "synced", syncError: null }))
        .catch((e) => dispatch({ syncStatus: "error", syncError: e.message ?? "Sync failed" }));
    }, 1500);
  };

  // Immediate Gist write (for add / delete / update — discrete user actions)
  const syncNow = (events, ignoredKeys) => {
    if (!tokenRef.current || !gistIdRef.current) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    dispatch({ syncStatus: "syncing" });
    writeGist(tokenRef.current, gistIdRef.current, events, ignoredKeys)
      .then(() => dispatch({ syncStatus: "synced", syncError: null }))
      .catch((e) => dispatch({ syncStatus: "error", syncError: e.message ?? "Sync failed" }));
  };

  // ── Connect / disconnect ─────────────────────────────────────────────────
  const connectGithub = async (token) => {
    saveGithubToken(token);
    dispatch({ githubToken: token, syncStatus: "connecting", syncError: null });
    try {
      const id = await findOrCreateGist(token, state.events, state.ignoredKeys);
      saveGistId(id);
      const { events, ignoredKeys } = await readGist(token, id);
      dispatch({
        gistId: id,
        events: events ?? state.events,
        ignoredKeys: ignoredKeys ?? state.ignoredKeys,
        syncStatus: "synced",
        syncError: null,
      });
    } catch (e) {
      clearGithubSync();
      dispatch({ githubToken: null, gistId: null, syncStatus: "error", syncError: e.message ?? "Connection failed" });
      throw e;
    }
  };

  const disconnectGithub = () => {
    clearGithubSync();
    dispatch({ githubToken: null, gistId: null, syncStatus: "idle", syncError: null });
  };

  // ── Event actions ────────────────────────────────────────────────────────
  const addEvent = (eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...state.events, newEvent];
    saveEvents(updated);
    dispatch({ events: updated });
    syncNow(updated, state.ignoredKeys);
  };

  const deleteEvent = (id) => {
    const updated = state.events.filter((e) => e.id !== id);
    saveEvents(updated);
    dispatch({
      events: updated,
      selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
    });
    syncNow(updated, state.ignoredKeys);
  };

  const updateEvent = (id, payload) => {
    const updated = state.events.map((e) =>
      e.id === id ? { ...e, payload, updatedAt: new Date().toISOString() } : e
    );
    saveEvents(updated);
    dispatch({ events: updated });
    syncNow(updated, state.ignoredKeys);
  };

  const selectEvent = (id) => {
    dispatch({ selectedEventId: id, actualPayload: "", reorderActive: false });
  };

  const setActualPayload = (payload) => {
    dispatch({ actualPayload: payload });
  };

  const toggleReorder = () => {
    dispatch({ reorderActive: !state.reorderActive });
  };

  const setPlatformFilter = (platform) => {
    dispatch({ platformFilter: platform });
  };

  const addIgnoredKey = (key) => {
    const trimmed = key.trim();
    if (!trimmed || state.ignoredKeys.includes(trimmed)) return;
    const updated = [...state.ignoredKeys, trimmed];
    saveIgnoredKeys(updated);
    dispatch({ ignoredKeys: updated });
    scheduleSync(state.events, updated);
  };

  const removeIgnoredKey = (key) => {
    const updated = state.ignoredKeys.filter((k) => k !== key);
    saveIgnoredKeys(updated);
    dispatch({ ignoredKeys: updated });
    scheduleSync(state.events, updated);
  };

  const selectedEvent = state.events.find((e) => e.id === state.selectedEventId) ?? null;

  return {
    state,
    selectedEvent,
    addEvent,
    deleteEvent,
    updateEvent,
    selectEvent,
    setActualPayload,
    toggleReorder,
    setPlatformFilter,
    addIgnoredKey,
    removeIgnoredKey,
    connectGithub,
    disconnectGithub,
  };
}
