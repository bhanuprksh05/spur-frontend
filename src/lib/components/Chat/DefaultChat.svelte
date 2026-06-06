<script lang="ts">
  import { chatStore } from "$lib/stores/chatStore";

  // Pre-load prompt template suggestions
  const promptSuggestions = [
    {
      title: "Track My Order",
      desc: "Check the current status of your order.",
      prompt: "Where is my order? Can you track it for me?",
    },
    {
      title: "Return a Product",
      desc: "Understand how to return an item.",
      prompt: "I want to return a product. What is your return policy?",
    },
    {
      title: "Payment Options",
      desc: "See available payment methods.",
      prompt: "What payment methods do you support? Is cash on delivery available?",
    },
    {
      title: "Cancel Order",
      desc: "Help with cancelling an order.",
      prompt: "Can I cancel my order? What is the cancellation policy?",
    },
  ];
</script>

<div
  class="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center h-full text-center"
>
  <div
    class="h-16 w-16 rounded-2xl bg-wa-green/10 flex items-center justify-center border border-wa-green/30 text-wa-green mb-6 animate-bounce"
  >
    <svg
      class="h-8 w-8 text-wa-green"
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

  <h2
    class="text-2xl font-bold text-wa-text-primary mb-2 tracking-tight"
  >
    How can I help you today?
  </h2>
  <p
    class="text-sm text-wa-text-secondary max-w-md mb-10 leading-relaxed font-normal"
  >
    Ask me coding questions, database suggestions, or request templates.
  </p>

  <!-- Quick Suggestion Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
    {#each promptSuggestions as item}
      <button
        onclick={() => chatStore.sendMessage(item.prompt)}
        class="p-4 rounded-2xl bg-wa-panel border border-wa-border hover:bg-wa-hover hover:border-wa-border/80 hover:shadow-lg transition-all duration-200 group text-left cursor-pointer"
      >
        <h3
          class="text-xs font-semibold text-wa-text-primary group-hover:text-wa-green flex items-center justify-between mb-1"
        >
          {item.title}
          <svg
            class="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-wa-green transform translate-x-1 group-hover:translate-x-0 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </h3>
        <p class="text-xs text-wa-text-secondary line-clamp-2">
          {item.desc}
        </p>
      </button>
    {/each}
  </div>
</div>
