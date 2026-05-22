<script lang="ts">
  interface Props {
    title: string;
    description: string;
  }

  let { title, description }: Props = $props();
</script>

<article class="card">
  <h2>{title}</h2>
  <p>{description}</p>
</article>

<style>
  .card {
    padding: 20px;
    background: white;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }
  h2 {
    margin: 0 0 8px;
    font-size: 16px;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
</style>
