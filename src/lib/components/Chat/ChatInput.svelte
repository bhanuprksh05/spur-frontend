<script lang="ts">
  import { chatStore } from "$lib/stores/chatStore";

  let input = $state("");
  const MAX_CHARS = 1000;

  function handleSubmit() {
    const text = input.trim();
    if (!text || text.length > MAX_CHARS || $chatStore.loading) return;
    chatStore.sendMessage(text);
    input = "";
  }
</script>

<div class="p-6 bg-wa-bg border-t border-wa-border flex-shrink-0">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
    class="max-w-4xl mx-auto flex items-end gap-2 bg-wa-input border border-wa-border rounded-2xl p-2 focus-within:border-wa-green/50 focus-within:ring-1 focus-within:ring-wa-green/20 transition-all duration-200"
  >
    <textarea
      bind:value={input}
      placeholder="Ask Spur anything..."
      maxlength={MAX_CHARS}
      class="flex-1 bg-transparent border-none text-wa-text-primary placeholder-wa-text-secondary focus:outline-none focus:ring-0 max-h-32 min-h-[44px] py-2 px-3 resize-none custom-scrollbar"
      onkeydown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      }}
    ></textarea>

    <div class="flex flex-col items-end gap-1.5 px-1 pb-1">
      {#if input.length > 0}
        <span
          class="text-[10px] transition-colors duration-150 {input.length >=
          MAX_CHARS - 50
            ? 'text-rose-500 font-semibold'
            : 'text-wa-text-secondary'}"
        >
          {input.length}/{MAX_CHARS}
        </span>
      {/if}
      <button
        type="submit"
        disabled={!input.trim() ||
          input.length > MAX_CHARS ||
          $chatStore.loading}
        aria-label="Send message"
        class="h-10 w-10 bg-wa-green hover:brightness-110 text-[#0b141a] rounded-xl flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none hover:scale-105 active:scale-95 transition-all duration-150 flex-shrink-0 cursor-pointer"
      >
        <svg
          class="h-5 w-5 rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  </form>
</div>
