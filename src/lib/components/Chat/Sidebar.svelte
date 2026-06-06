<script lang="ts">
  import { chatStore } from "$lib/stores/chatStore";

  let { onSelectSession, onDeleteSession, onStartNewChat } = $props<{
    onSelectSession: (id: string) => void;
    onDeleteSession: (e: Event, id: string) => void;
    onStartNewChat: () => void;
  }>();

  let isOpen = $state(false);

  function openSidebar() {
    isOpen = true;
  }

  function closeSidebar() {
    isOpen = false;
  }

  function handleSelectSession(id: string) {
    onSelectSession(id);
    closeSidebar(); // close drawer on mobile after selecting
  }

  function handleStartNewChat() {
    onStartNewChat();
    closeSidebar();
  }

  // Helper: Format ISO timestamp
  function formatTime(isoString: string) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
</script>

<!-- Mobile hamburger toggle (visible only on small screens) -->
<button
  onclick={openSidebar}
  class="fixed top-3 left-3 z-40 md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-wa-panel border border-wa-border shadow-md text-wa-text-secondary hover:text-wa-text-primary hover:bg-wa-hover transition-all duration-200 cursor-pointer"
  aria-label="Open sidebar"
>
  <svg
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
</button>

<!-- Backdrop (mobile only) -->
{#if isOpen}
  <div
    class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
    onclick={closeSidebar}
    role="presentation"
  ></div>
{/if}

<!-- Sidebar panel -->
<aside
  class="
    fixed inset-y-0 left-0 z-40 w-80 flex flex-col flex-shrink-0
    bg-wa-panel border-r border-wa-border
    transition-transform duration-300 ease-in-out
    {isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:relative md:translate-x-0 md:z-auto md:h-full
  "
>
  <!-- Sidebar Header -->
  <div class="p-4 border-b border-wa-border flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div
        class="h-8 w-8 rounded-lg bg-wa-green flex items-center justify-center shadow-lg shadow-wa-green/10"
      >
        <svg
          class="h-4 w-4 text-[#0b141a]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <span class="font-semibold text-base tracking-wide text-wa-text-primary"
        >Spur Chat AI</span
      >
    </div>

    <div class="flex items-center gap-2">
      <span
        class="text-xs px-2 py-0.5 bg-wa-hover text-wa-text-secondary rounded-full border border-wa-border"
        >v1.0</span
      >
      <!-- Close button (mobile only) -->
      <button
        onclick={closeSidebar}
        class="md:hidden flex items-center justify-center h-7 w-7 rounded-lg text-wa-text-secondary hover:text-wa-text-primary hover:bg-wa-hover transition-all duration-150 cursor-pointer"
        aria-label="Close sidebar"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- New Chat Button -->
  <div class="p-4 border-b border-wa-border/40">
    <button
      onclick={handleStartNewChat}
      class="w-full py-3 px-4 rounded-xl bg-wa-green hover:brightness-110 text-[#0b141a] font-medium text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
      New Chat
    </button>
  </div>

  <!-- History List -->
  <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
    <span
      class="text-xs font-semibold text-wa-text-secondary uppercase tracking-wider px-3 mb-2 block"
      >Recent Chats</span
    >

    {#if $chatStore.sessions.length === 0}
      <div class="py-8 px-4 text-center text-wa-text-secondary text-xs">
        <svg
          class="h-8 w-8 mx-auto mb-2 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        No conversations yet
      </div>
    {:else}
      {#each $chatStore.sessions as session (session.id)}
        {@const isActive = $chatStore.activeSessionId === session.id}
        {@const lastMsg = session.messages?.[0]}
        <button
          onclick={() => handleSelectSession(session.id)}
          class="w-full text-left p-3 rounded-xl flex items-start gap-3 border transition-all duration-200 group relative cursor-pointer
            {isActive
            ? 'bg-wa-active border-wa-green/20 text-wa-text-primary shadow-[inset_0_0_12px_rgba(0,168,132,0.15)]'
            : 'bg-transparent border-transparent text-wa-text-secondary hover:bg-wa-hover hover:text-wa-text-primary hover:border-wa-border/40'}"
        >
          <div class="mt-1 flex-shrink-0">
            <svg
              class="h-4 w-4 {isActive
                ? 'text-wa-green'
                : 'text-wa-text-secondary'}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>

          <div class="flex-1 min-w-0 pr-6">
            <div class="flex justify-between items-baseline mb-1">
              <span
                class="text-xs font-semibold truncate block text-wa-text-primary"
              >
                {lastMsg
                  ? lastMsg.content.substring(0, 18)
                  : "New Chat Session"}
              </span>
              <span
                class="text-[10px] text-wa-text-secondary flex-shrink-0 ml-1"
              >
                {formatTime(session.updatedAt || session.createdAt)}
              </span>
            </div>
            <p class="text-xs text-wa-text-secondary truncate">
              {lastMsg ? lastMsg.content : "No messages yet"}
            </p>
          </div>

          <!-- Delete Button (visible on hover / touch) -->
          <div
            role="button"
            tabindex="0"
            onclick={(e) => onDeleteSession(e, session.id)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onDeleteSession(e, session.id);
              }
            }}
            class="absolute right-2 top-3 p-1 rounded-md bg-wa-input hover:bg-red-950/30 text-wa-text-secondary hover:text-red-400
              opacity-0 group-hover:opacity-100
              sm:opacity-0 sm:group-hover:opacity-100
              transition-opacity duration-150 cursor-pointer"
            title="Delete Chat"
          >
            <svg
              class="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </button>
      {/each}
    {/if}
  </div>
</aside>
