<script lang="ts">
  let count = $state(0);
</script>

<button class="counter" onclick={() => count++}>
  Clicked {count} times
</button>

<style>
  .counter {
    padding: 10px 16px;
    border-radius: 8px;
    background: #5050fa;
    color: white;
    border: 0;
    font-size: 14px;
    cursor: pointer;
  }
  .counter:hover {
    background: #6464ff;
  }
</style>
