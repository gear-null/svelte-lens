<script lang="ts">
  interface Props {
    isActive: boolean;
    enabled: boolean;
    onToggle: () => void;
  }

  let { isActive, enabled, onToggle }: Props = $props();

  const handleClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };
</script>

{#if enabled}
  <button
    class="lens-toolbar"
    class:active={isActive}
    onclick={handleClick}
    aria-label="Toggle svelte-lens"
    aria-pressed={isActive}
  >
    <span class="lens-toolbar-dot"></span>
    <span class="lens-toolbar-text">lens</span>
  </button>
{/if}

<style>
  .lens-toolbar {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2147483646;
    pointer-events: auto;
    background: rgba(20, 20, 20, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 8px 12px;
    border-radius: 999px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      sans-serif;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    transition: transform 100ms ease;
  }
  .lens-toolbar:hover {
    transform: translateY(-1px);
  }
  .lens-toolbar.active .lens-toolbar-dot {
    background: #10b981;
  }
  .lens-toolbar-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #5050fa;
    transition: background 100ms ease;
  }
  .lens-toolbar-text {
    font-weight: 500;
    letter-spacing: 0.02em;
  }
</style>
