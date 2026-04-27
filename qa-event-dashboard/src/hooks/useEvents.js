"use client";

import { useReducer, useEffect } from "react";
import { loadEvents, saveEvents, loadIgnoredKeys, saveIgnoredKeys } from "@/lib/storage";
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
      product: {
        id: "prod_001",
        name: "Pro Plan",
        price: 99.99,
        currency: "USD",
      },
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
};

function reducer(state, update) {
  return { ...state, ...update };
}

export function useEvents() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const stored = loadEvents();
    const storedIgnored = loadIgnoredKeys();

    if (stored.length === 0) {
      dispatch({ events: SEED_EVENTS, ignoredKeys: storedIgnored });
      saveEvents(SEED_EVENTS);
    } else {
      dispatch({ events: stored, ignoredKeys: storedIgnored });
    }
  }, []);

  useEffect(() => {
    if (state.events.length > 0) saveEvents(state.events);
  }, [state.events]);

  useEffect(() => {
    saveIgnoredKeys(state.ignoredKeys);
  }, [state.ignoredKeys]);

  const addEvent = (eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ events: [...state.events, newEvent] });
  };

  const deleteEvent = (id) => {
    const updated = state.events.filter((e) => e.id !== id);
    dispatch({
      events: updated,
      selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
    });
  };

  const updateEvent = (id, payload) => {
    dispatch({
      events: state.events.map((e) =>
        e.id === id ? { ...e, payload, updatedAt: new Date().toISOString() } : e
      ),
    });
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
    dispatch({ ignoredKeys: [...state.ignoredKeys, trimmed] });
  };

  const removeIgnoredKey = (key) => {
    dispatch({ ignoredKeys: state.ignoredKeys.filter((k) => k !== key) });
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
  };
}
