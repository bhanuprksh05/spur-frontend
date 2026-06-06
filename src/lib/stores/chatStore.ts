import { writable } from "svelte/store";
import { tick } from "svelte";
import type { Message, Session } from "../types/chat";

import {
  fetchChatHistory,
  fetchSessionsBatch,
  sendChatMessage,
} from "$lib/services/chatService";

function createChatStore() {
  const { subscribe, update } = writable({
    messages: [] as Message[],
    sessions: [] as Session[],
    allSessionIds: [] as string[],
    activeSessionId: null as string | null,

    loading: false,
    loadingHistory: false,
    errorMsg: null as string | null,

    hasMoreMessages: true,
    sidebarPage: 1,
  });

  function scrollToBottom() {
    const el = document.getElementById("chat-bottom");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  // ---------------- INITIALIZE ----------------
  async function init() {
    const storedIds = localStorage.getItem("spur_session_ids");
    let initialIds: string[] = [];
    if (storedIds) {
      try {
        initialIds = JSON.parse(storedIds);
      } catch (e) {}
    }

    const storedActiveId = localStorage.getItem("spur_active_session_id");
    let activeId: string | null = null;
    if (storedActiveId && initialIds.includes(storedActiveId)) {
      activeId = storedActiveId;
    }

    update((s) => ({
      ...s,
      allSessionIds: initialIds,
      activeSessionId: activeId,
    }));

    if (initialIds.length > 0) {
      try {
        const data = await fetchSessionsBatch(initialIds.slice(0, 10));
        update((s) => ({
          ...s,
          sessions: data.sessions || [],
        }));
      } catch (err) {
        console.error("Error fetching sessions in init:", err);
      }
    }

    if (activeId) {
      await loadHistory(activeId);
    }
  }

  // ---------------- SEND MESSAGE ----------------
  async function sendMessage(input: string) {
    let tempUserMsg: Message;

    update((state) => {
      if (!input.trim() || state.loading) return state;

      tempUserMsg = {
        id: "temp-" + Date.now(),
        role: "user",
        content: input,
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        messages: [...state.messages, tempUserMsg],
        loading: true,
        errorMsg: null,
      };
    });

    await tick();
    scrollToBottom();

    try {
      const state = getState();

      const data = await sendChatMessage({
        content: input,
        sessionId: state.activeSessionId || undefined,
      });

      const assistantMsg = data.message;

      update((state) => {
        // NEW SESSION
        if (state.activeSessionId !== data.sessionId) {
          const newSessionId = data.sessionId;
          localStorage.setItem("spur_active_session_id", newSessionId);

          const updatedAllIds = [newSessionId, ...state.allSessionIds];
          localStorage.setItem("spur_session_ids", JSON.stringify(updatedAllIds));

          // Fetch new session info asynchronously
          setTimeout(async () => {
            try {
              const batchData = await fetchSessionsBatch([newSessionId]);
              update((s) => {
                const newSession = batchData.sessions?.[0] || {
                  id: newSessionId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  messages: [assistantMsg],
                };
                return {
                  ...s,
                  sessions: [newSession, ...s.sessions],
                };
              });
            } catch (e) {
              update((s) => ({
                ...s,
                sessions: [
                  {
                    id: newSessionId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    messages: [assistantMsg],
                  },
                  ...s.sessions,
                ],
              }));
            }
            await loadHistory(newSessionId);
          }, 0);

          return {
            ...state,
            activeSessionId: newSessionId,
            allSessionIds: updatedAllIds,
          };
        }

        // EXISTING SESSION
        const idx = state.sessions.findIndex((s) => s.id === state.activeSessionId);
        let updatedSessions = [...state.sessions];
        if (idx !== -1) {
          const updated = { ...state.sessions[idx] };
          updated.messages = [assistantMsg];
          updated.updatedAt = new Date().toISOString();
          updatedSessions = [
            updated,
            ...state.sessions.filter((s) => s.id !== state.activeSessionId),
          ];
        }

        return {
          ...state,
          sessions: updatedSessions,
          messages: [
            ...state.messages.filter((m) => m.id !== tempUserMsg.id),
            {
              id: "user-" + Date.now(),
              role: "user",
              content: input,
              createdAt: new Date().toISOString(),
            },
            assistantMsg,
          ],
        };
      });
    } catch (err: any) {
      update((state) => ({
        ...state,
        errorMsg: err.message,
        messages: state.messages.filter((m) => m.id !== tempUserMsg!.id),
      }));
    } finally {
      update((state) => ({ ...state, loading: false }));
      await tick();
      scrollToBottom();
    }
  }

  // ---------------- LOAD HISTORY ----------------
  async function loadHistory(sessionId: string) {
    update((s) => ({
      ...s,
      loadingHistory: true,
      errorMsg: null,
      hasMoreMessages: true,
    }));

    try {
      const data = await fetchChatHistory(sessionId, { limit: 10 });

      update((s) => ({
        ...s,
        messages: data.history,
        hasMoreMessages: data.history.length >= 10,
      }));

      await tick();
      scrollToBottom();
    } catch (err: any) {
      update((s) => ({
        ...s,
        errorMsg: err.message,
      }));
    } finally {
      update((s) => ({ ...s, loadingHistory: false }));
    }
  }

  // ---------------- LOAD MORE SESSIONS ----------------
  async function loadMoreSessions() {
    let idsToFetch: string[] = [];

    update((s) => {
      const nextPage = s.sidebarPage + 1;
      const start = (nextPage - 1) * 10;
      const end = start + 10;
      idsToFetch = s.allSessionIds.slice(start, end);
      return s;
    });

    if (idsToFetch.length === 0) return;

    try {
      const data = await fetchSessionsBatch(idsToFetch);

      update((s) => ({
        ...s,
        sessions: [...s.sessions, ...data.sessions],
        sidebarPage: s.sidebarPage + 1,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- LOAD OLDER MESSAGES (PAGINATION) ----------------
  async function loadOlderMessages(oldestMsgId: string, limit = 10) {
    const state = getState();
    if (!state.activeSessionId || state.loadingHistory || !state.hasMoreMessages) return 0;

    update((s) => ({ ...s, loadingHistory: true }));

    try {
      const data = await fetchChatHistory(state.activeSessionId, {
        cursor: oldestMsgId,
        limit,
      });
      const oldMessages = data.history;

      update((s) => ({
        ...s,
        hasMoreMessages: oldMessages.length >= limit,
        messages: [...oldMessages, ...s.messages],
      }));
      return oldMessages.length;
    } catch (err: any) {
      console.error("Error loading older messages:", err);
      return 0;
    } finally {
      update((s) => ({ ...s, loadingHistory: false }));
    }
  }

  // ---------------- SELECT SESSION ----------------
  async function selectSession(sessionId: string) {
    const state = getState();
    if (state.activeSessionId === sessionId) return;

    update((s) => ({
      ...s,
      activeSessionId: sessionId,
      messages: [],
    }));
    localStorage.setItem("spur_active_session_id", sessionId);
    await loadHistory(sessionId);
  }

  // ---------------- DELETE SESSION ----------------
  function deleteSession(sessionId: string) {
    update((s) => {
      const allSessionIds = s.allSessionIds.filter((id) => id !== sessionId);
      localStorage.setItem("spur_session_ids", JSON.stringify(allSessionIds));

      const sessions = s.sessions.filter((session) => session.id !== sessionId);

      let activeSessionId = s.activeSessionId;
      let messages = s.messages;
      let hasMoreMessages = s.hasMoreMessages;

      if (activeSessionId === sessionId) {
        activeSessionId = null;
        localStorage.removeItem("spur_active_session_id");
        messages = [];
        hasMoreMessages = true;
      }

      return {
        ...s,
        allSessionIds,
        sessions,
        activeSessionId,
        messages,
        hasMoreMessages,
      };
    });
  }

  // ---------------- START NEW CHAT ----------------
  function startNewChat() {
    localStorage.removeItem("spur_active_session_id");
    update((s) => ({
      ...s,
      activeSessionId: null,
      messages: [],
      hasMoreMessages: true,
      errorMsg: null,
    }));
  }

  // ---------------- CLEAR ERROR ----------------
  function clearError() {
    update((s) => ({ ...s, errorMsg: null }));
  }

  // helper to read state
  let currentState: any;
  subscribe((v) => (currentState = v));
  const getState = () => currentState;

  return {
    subscribe,
    init,
    sendMessage,
    loadHistory,
    loadMoreSessions,
    loadOlderMessages,
    selectSession,
    deleteSession,
    startNewChat,
    clearError,
  };
}

export const chatStore = createChatStore();