<script lang="ts">
  import { onMount, tick } from "svelte";
  import Sidebar from "$lib/components/Chat/Sidebar.svelte";
  import MessageBubble from "$lib/components/Chat/MessageBubble.svelte";
  import ChatInput from "$lib/components/Chat/ChatInput.svelte";
  import DefaultChat from "$lib/components/Chat/DefaultChat.svelte";

  import { chatStore } from "$lib/stores/chatStore";

  let isInitializing = true;
  let prevMessageCount = 0;
  let isSessionSwitching = false;

  $effect(() => {
    if (
      !isInitializing &&
      !isSessionSwitching &&
      $chatStore.messages.length > prevMessageCount
    ) {
      const wasAtBottom = prevMessageCount === 0 || isNearBottom();
      prevMessageCount = $chatStore.messages.length;
      if (wasAtBottom) {
        tick().then(scrollToBottom);
      }
    }
  });

  function isNearBottom(): boolean {
    const container = document.querySelector(".overflow-y-auto");
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100
    );
  }

  function scrollToBottom() {
    document
      .getElementById("chat-bottom")
      ?.scrollIntoView({ behavior: "instant" });
  }

  // Fetch older messages on scroll-to-top
  async function handleScroll(e: Event) {
    if (isInitializing) return;
    const container = e.target as HTMLDivElement;
    if (
      !container ||
      $chatStore.loadingHistory ||
      !$chatStore.hasMoreMessages ||
      !$chatStore.activeSessionId
    )
      return;

    if (container.scrollTop <= 5) {
      const oldestMsg = $chatStore.messages[0];
      if (!oldestMsg || oldestMsg.id.startsWith("temp-")) return;

      const oldScrollHeight = container.scrollHeight;
      // Save count BEFORE load so reactive block doesn't auto-scroll
      prevMessageCount = $chatStore.messages.length;
      const loadedCount = await chatStore.loadOlderMessages(oldestMsg.id);

      if (loadedCount > 0) {
        await tick();
        container.scrollTop = container.scrollHeight - oldScrollHeight;
        // Sync count after prepend so reactive block doesn't double-fire
        prevMessageCount = $chatStore.messages.length;
      }
    }
  }

  // Switch chat sessions
  async function selectSession(sessionId: string) {
    isSessionSwitching = true;
    prevMessageCount = 0;
    await chatStore.selectSession(sessionId);
    await tick();
    scrollToBottom();
    prevMessageCount = $chatStore.messages.length;
    isSessionSwitching = false;
  }

  // Delete chat session
  function deleteSession(e: Event, sessionId: string) {
    e.stopPropagation(); // prevent selectSession trigger
    chatStore.deleteSession(sessionId);
  }

  // Start new chat session
  function startNewChat() {
    prevMessageCount = 0;
    chatStore.startNewChat();
  }

  onMount(async () => {
    await chatStore.init();
    await tick();
    scrollToBottom();
    prevMessageCount = $chatStore.messages.length;
    isInitializing = false;
  });
</script>

<div
  class="h-screen w-screen flex bg-wa-bg text-wa-text-primary overflow-hidden"
>
  <!-- Sidebar Component -->
  <Sidebar
    onSelectSession={selectSession}
    onDeleteSession={deleteSession}
    onStartNewChat={startNewChat}
  />

  <!-- Chat Area -->
  <main class="flex-1 h-full flex flex-col bg-wa-bg relative overflow-hidden">
    <!-- Top Header -->
    <header
      class="h-16 border-b border-wa-border bg-wa-header flex items-center justify-between px-6 z-10 flex-shrink-0"
    >
      <div class="flex items-center gap-3 pl-10 md:pl-0">
        {#if $chatStore.activeSessionId}
          <div>
            <div class="flex items-center gap-2">
              <span
                class="text-sm font-semibold text-wa-text-primary truncate max-w-xs block"
                >Chat Session</span
              >
              <span
                class="text-[10px] font-mono px-2 py-0.5 bg-wa-input text-wa-text-secondary border border-wa-border rounded-md"
              >
                {$chatStore.activeSessionId.substring(0, 8)}...
              </span>
            </div>
          </div>
        {:else}
          <span class="text-sm font-semibold text-wa-text-secondary"
            >New Conversation</span
          >
        {/if}
      </div>

      <div class="flex items-center gap-3">
        <!-- LLM Badge -->
        <span
          class="text-xs px-2.5 py-1 bg-wa-green/10 text-wa-green border border-wa-green/20 rounded-full flex items-center gap-1.5 font-medium shadow-[0_0_15px_rgba(0,168,132,0.08)]"
        >
          <svg
            class="h-3.5 w-3.5 animate-pulse text-wa-green"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clip-rule="evenodd"
            />
          </svg>
          AI Assistant
        </span>
      </div>
    </header>

    <!-- Error Banner -->
    {#if $chatStore.errorMsg}
      <div
        class="p-3 bg-red-950/40 border-b border-red-900/50 text-red-400 text-xs flex justify-between items-center px-6"
      >
        <div class="flex items-center gap-2">
          <svg
            class="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {$chatStore.errorMsg}
        </div>
        <button
          onclick={() => chatStore.clearError()}
          class="hover:text-red-200 cursor-pointer">Dismiss</button
        >
      </div>
    {/if}

    <!-- Chat Messages Panel -->
    <div
      onscroll={handleScroll}
      class="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar bg-[radial-gradient(#1c2c35_1px,transparent_1px)] [background-size:20px_20px] bg-opacity-40"
    >
      {#if $chatStore.messages.length === 0}
        <!-- Welcome Splash Screen -->
        <DefaultChat />
      {:else}
        <!-- Message Feed -->
        <div class="max-w-4xl mx-auto space-y-6">
          <!-- History loading indicator -->
          {#if $chatStore.loadingHistory}
            <div
              class="flex items-center justify-center py-2 text-xs text-wa-text-secondary gap-2"
            >
              <svg
                class="animate-spin h-3.5 w-3.5 text-wa-green"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading previous messages...
            </div>
          {/if}

          {#each $chatStore.messages as msg (msg.id)}
            <MessageBubble {msg} />
          {/each}

          <!-- Bot Typing Indicator bubble -->
          {#if $chatStore.loading}
            <div
              class="flex justify-start items-center gap-3 animate-fade-in-up"
            >
              <div
                class="h-8 w-8 rounded-lg bg-wa-green/20 flex items-center justify-center shadow-lg shadow-wa-green/10 border border-wa-green/30"
              >
                <svg
                  class="h-4 w-4 text-wa-green"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>

              <div
                class="bg-wa-bubble-recv border border-wa-border rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center"
              >
                <div
                  class="h-1.5 w-1.5 rounded-full bg-wa-text-secondary animate-dot-1"
                ></div>
                <div
                  class="h-1.5 w-1.5 rounded-full bg-wa-text-secondary animate-dot-2"
                ></div>
                <div
                  class="h-1.5 w-1.5 rounded-full bg-wa-text-secondary animate-dot-3"
                ></div>
              </div>
            </div>
          {/if}
          <div id="chat-bottom"></div>
        </div>
      {/if}
    </div>

    <!-- Input Footer Panel Component -->
    <ChatInput />
  </main>
</div>

<style>
  /* Custom scrollbar styling */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.16);
  }

  /* Custom animations */
  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  .animate-dot-1 {
    animation: pulse-dot 1.4s infinite 0s;
  }
  .animate-dot-2 {
    animation: pulse-dot 1.4s infinite 0.2s;
  }
  .animate-dot-3 {
    animation: pulse-dot 1.4s infinite 0.4s;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
