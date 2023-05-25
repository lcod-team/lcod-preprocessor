<script>
import InternalComponent from "src/palette/HelloWorld.lcod/palette/InternalComponent.svelte";
</script>
  <InternalComponent name="Hello World !!" />
  <InternalComponent name="With Slots">
      <InternalComponent name="First in Slot" --color="lightgreen" />
      <InternalComponent name="Second in Slot" --color="orange" />
  </InternalComponent>
  <InternalComponent name="With header and footers" --color="yellow">
    <svelte:fragment slot="header">
        <InternalComponent name="In header" --color="lightblue" />
    </svelte:fragment>
    <svelte:fragment slot="footer">
        <InternalComponent name="In footer" />
        <InternalComponent />
    </svelte:fragment>
  </InternalComponent>

