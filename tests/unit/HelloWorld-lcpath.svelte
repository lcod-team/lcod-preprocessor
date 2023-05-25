<script>
import InternalComponent from "src/palette/HelloWorld.lcod/palette/InternalComponent.svelte";
</script>
  {@html '<!-- start-926fjs/0 -->'}
  <InternalComponent name="Hello World !!" />
  {@html '<!-- end-926fjs/0 -->'}
  {@html '<!-- start-926fjs/1 -->'}
  <InternalComponent name="With Slots">
      {@html '<!-- start-926fjs/1/:default/0 -->'}
      <InternalComponent name="First in Slot" --color="lightgreen" />
      {@html '<!-- end-926fjs/1/:default/0 -->'}
      {@html '<!-- start-926fjs/1/:default/1 -->'}
      <InternalComponent name="Second in Slot" --color="orange" />
      {@html '<!-- end-926fjs/1/:default/1 -->'}
  </InternalComponent>
  {@html '<!-- end-926fjs/1 -->'}
  {@html '<!-- start-926fjs/2 -->'}
  <InternalComponent name="With header and footers" --color="yellow">
    <svelte:fragment slot="header">
        {@html '<!-- start-926fjs/2/:header/0 -->'}
        <InternalComponent name="In header" --color="lightblue" />
        {@html '<!-- end-926fjs/2/:header/0 -->'}
    </svelte:fragment>
    <svelte:fragment slot="footer">
        {@html '<!-- start-926fjs/2/:footer/0 -->'}
        <InternalComponent name="In footer" />
        {@html '<!-- end-926fjs/2/:footer/0 -->'}
        {@html '<!-- start-926fjs/2/:footer/1 -->'}
        <InternalComponent />
        {@html '<!-- end-926fjs/2/:footer/1 -->'}
    </svelte:fragment>
  </InternalComponent>
  {@html '<!-- end-926fjs/2 -->'}

