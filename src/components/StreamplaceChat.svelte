<script lang="ts">
    import { onDestroy, onMount } from "svelte";

  const wsUrl = `wss://stream.place/api/websocket/${encodeURIComponent("zeu.dev")}`;
  const websocket = new WebSocket(wsUrl);
  let chat = $state([]);
  let title = $state("");
  let viewerCount = $state(0);

  websocket.onopen = () => {
    console.log("Chat connected", "success");
  };

  websocket.onclose = (e) => {
    console.log(`Chat disconnected (code ${e.code})`);
  };

  websocket.onerror = () => {
    console.log("Chat WebSocket error", "error");
  };

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.$type === "place.stream.chat.defs#messageView") {
        // @ts-ignore
        chat.push(data);
      } 
      else if (data.$type === "place.stream.livestream#livestreamView") {
        title = data.record?.title || "";
      }
      else if (data.$type === "place.stream.livestream#viewerCount") {
        viewerCount = data.count;
      }
    } catch {
      // Ignore non-JSON or unknown message types
    }
  };

  $effect(() => {
    // @ts-ignore
    chat = chat.toSorted((a, b) => new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime());
  });

  onDestroy(() => {
    websocket.close();
  });
</script>


<p>👁️ {viewerCount} Viewers</p>
<div class="w-lg">
  {#each chat as msg}
    <span class="flex gap-4">
      <a href={`https://${msg.author.handle}`} class="text-blue-500 hover:underline">{msg.author.handle}</a>
      <p class="text-wrap">{msg.record.text}</p>
    </span>
  {/each}
</div>
