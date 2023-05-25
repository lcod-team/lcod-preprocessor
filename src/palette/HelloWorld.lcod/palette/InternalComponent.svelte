<script>
	export let name = 'Internal Component';
</script>

<div>
	<slot name="header" />
	<h3>{name}</h3>
	<slot />
	<slot name="footer" />
</div>

<style>
	div {
		border-radius: 5px;
		border-style: solid;
		border-color: black;
		padding: 5px;
		margin: 5px;
		background-color: var(--color, lightgrey);
	}
</style>
