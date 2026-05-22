<script lang="ts">
  import type { Bounds } from "../types.js";
  import { OVERLAY_BORDER_COLOR, OVERLAY_FILL_COLOR } from "../constants.js";

  interface Props {
    visible: boolean;
    bounds: Bounds | null;
  }

  let { visible, bounds }: Props = $props();

  const style = $derived(() => {
    if (!visible || !bounds || bounds.width <= 0 || bounds.height <= 0) {
      return "display:none";
    }
    return [
      "position:fixed",
      "pointer-events:none",
      `transform:translate(${bounds.x}px, ${bounds.y}px)`,
      `width:${bounds.width}px`,
      `height:${bounds.height}px`,
      `border:1.5px solid ${OVERLAY_BORDER_COLOR}`,
      `background:${OVERLAY_FILL_COLOR}`,
      `border-radius:${bounds.borderRadius}`,
      "transition:transform 60ms linear, width 60ms linear, height 60ms linear",
      "box-sizing:border-box",
      "left:0",
      "top:0",
    ].join(";");
  });
</script>

<div style={style()}></div>
