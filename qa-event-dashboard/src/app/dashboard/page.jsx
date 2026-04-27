"use client";

import { useReducer } from "react";
import Sidebar from "@/components/Sidebar";
import DiffViewer from "@/components/DiffViewer";
import CompareLive from "@/components/CompareLive";
import SaveEventModal from "@/components/SaveEventModal";
import GithubSync from "@/components/GithubSync";
import TopNav from "@/components/TopNav";
import { useEvents } from "@/hooks/useEvents";

function pageReducer(s, u) {
  return { ...s, ...u };
}

export default function DashboardPage() {
  const [{ activeTab, showModal, showSync }, dispatch] = useReducer(pageReducer, {
    activeTab: "saved",
    showModal: false,
    showSync: false,
  });

  const {
    state,
    selectedEvent,
    addEvent,
    deleteEvent,
    updateEvent,
    selectEvent,
    setActualPayload,
    toggleReorder,
    addIgnoredKey,
    removeIgnoredKey,
    connectGithub,
    disconnectGithub,
  } = useEvents();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <TopNav
        activeTab={activeTab}
        onTabChange={(tab) => dispatch({ activeTab: tab })}
        syncStatus={state.syncStatus}
        onSyncClick={() => dispatch({ showSync: true })}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {activeTab === "saved" && (
          <>
            <Sidebar
              events={state.events}
              selectedEventId={state.selectedEventId}
              onSelect={selectEvent}
              onDelete={deleteEvent}
              onNewEvent={() => dispatch({ showModal: true })}
            />

            <DiffViewer
              selectedEvent={selectedEvent}
              actualPayload={state.actualPayload}
              reorderActive={state.reorderActive}
              ignoredKeys={state.ignoredKeys}
              onActualChange={setActualPayload}
              onToggleReorder={toggleReorder}
              onAddIgnoredKey={addIgnoredKey}
              onRemoveIgnoredKey={removeIgnoredKey}
              onUpdateBaseline={updateEvent}
            />
          </>
        )}

        {activeTab === "live" && (
          <CompareLive
            ignoredKeys={state.ignoredKeys}
            onAddIgnoredKey={addIgnoredKey}
            onRemoveIgnoredKey={removeIgnoredKey}
          />
        )}
      </div>

      {showModal && (
        <SaveEventModal
          onSave={addEvent}
          onClose={() => dispatch({ showModal: false })}
        />
      )}

      {showSync && (
        <GithubSync
          syncStatus={state.syncStatus}
          syncError={state.syncError}
          gistId={state.gistId}
          githubToken={state.githubToken}
          onConnect={connectGithub}
          onDisconnect={disconnectGithub}
          onClose={() => dispatch({ showSync: false })}
        />
      )}
    </div>
  );
}
