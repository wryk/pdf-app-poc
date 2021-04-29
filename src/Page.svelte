<svelte:options immutable={true}/>

<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let page
</script>

<div class="page">
	<img src={page.previewUrl} alt="Page" class="page-preview">

	<div>
		<button on:click={() => dispatch('previous')}>PREV</button>
		<button on:click={() => dispatch('next')}>NEXT</button>
		<button on:click={() => dispatch('remove')}>REMOVE</button>
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.page-preview {
		height: 256px;
	}
</style>
