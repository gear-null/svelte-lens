export const SVELTEKIT_LAYOUT_BLOCK = `
  <script>
    import { dev } from "$app/environment";
    import { onMount } from "svelte";

    onMount(() => {
      if (dev) import("svelte-lens");
    });
  </script>
`.trim();

export const VITE_SVELTE_IMPORT = `if (import.meta.env.DEV) {\n  import("svelte-lens");\n}`;
