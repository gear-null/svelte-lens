<script lang="ts">
  import type { ActionContext, Bounds, ContextMenuAction, Position } from "../types.js";
  import Overlay from "./Overlay.svelte";
  import SelectionLabel from "./SelectionLabel.svelte";
  import Toolbar from "./Toolbar.svelte";
  import ContextMenu from "./ContextMenu.svelte";

  interface Props {
    selectionVisible: boolean;
    selectionBounds: Bounds | null;
    selectionTagName: string | null;
    selectionComponentName: string | null;
    selectionStatus: "idle" | "copying" | "copied" | "error";
    selectionStatusText?: string;
    toolbarVisible: boolean;
    toolbarEnabled: boolean;
    isActive: boolean;
    onToggleActive: () => void;
    contextMenuPosition: Position | null;
    contextMenuActions: ContextMenuAction[];
    actionContext: ActionContext | null;
    onContextMenuDismiss: () => void;
  }

  let {
    selectionVisible,
    selectionBounds,
    selectionTagName,
    selectionComponentName,
    selectionStatus,
    selectionStatusText,
    toolbarVisible,
    toolbarEnabled,
    isActive,
    onToggleActive,
    contextMenuPosition,
    contextMenuActions,
    actionContext,
    onContextMenuDismiss,
  }: Props = $props();
</script>

<Overlay visible={selectionVisible} bounds={selectionBounds} />
<SelectionLabel
  visible={selectionVisible}
  bounds={selectionBounds}
  tagName={selectionTagName}
  componentName={selectionComponentName}
  status={selectionStatus}
  statusText={selectionStatusText}
/>
{#if toolbarVisible}
  <Toolbar {isActive} enabled={toolbarEnabled} onToggle={onToggleActive} />
{/if}
<ContextMenu
  position={contextMenuPosition}
  actions={contextMenuActions}
  {actionContext}
  onDismiss={onContextMenuDismiss}
/>
