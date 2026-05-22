<script lang="ts">
  import { dev } from "$app/environment";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(() => {
    if (dev) {
      void import("@gear-null/svelte-lens");
    }
  });
</script>

{@render children?.()}

<style>
  :global(body) {
    margin: 0;
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      sans-serif;
    background: #fafafa;
    color: #111;
  }
</style>
