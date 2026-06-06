<script lang="ts">
  let { msg } = $props<{ msg: any }>();
</script>

<div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up">
  <div class="flex items-start gap-3 max-w-[85%]">
    <!-- Bot Avatar (left side) -->
    {#if msg.role !== 'user'}
      <div class="h-8 w-8 rounded-lg bg-wa-green/20 flex items-center justify-center shadow-md flex-shrink-0 border border-wa-green/30">
        <svg class="h-4 w-4 text-wa-green" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
      </div>
    {/if}

    <!-- Message bubble -->
    <div class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'}">
      <div 
        class="rounded-2xl px-4 py-3 text-sm leading-relaxed border shadow-md
          {msg.role === 'user'
            ? 'bg-wa-bubble-sent border-transparent text-wa-text-primary rounded-tr-none'
            : 'bg-wa-bubble-recv border-transparent text-wa-text-primary rounded-tl-none'}"
      >
        <div class="whitespace-pre-wrap selection:bg-wa-green/30 prose prose-invert max-w-none text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
      
      <span class="text-[9px] text-wa-text-secondary mt-1 px-1">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>

    <!-- User Avatar (right side) -->
    {#if msg.role === 'user'}
      <div class="h-8 w-8 rounded-lg bg-wa-input flex items-center justify-center border border-wa-border flex-shrink-0">
        <svg class="h-4 w-4 text-wa-text-secondary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
      </div>
    {/if}
  </div>
</div>
