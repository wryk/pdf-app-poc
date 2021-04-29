<svelte:options immutable={true}/>

<script lang="ts">
	import { PDFDocument } from 'pdf-lib'
	import { v4 as uuid } from 'uuid'
	import { dndzone } from 'svelte-dnd-action'
	import * as util from './util.js'
	import Page from './Page.svelte'

	const documentType = 'application/pdf'
	const allowedTypes = [documentType]

	let pages = []

	const handleNewFiles = async event => {
		const files = Array.from(event.target.files)
			.filter(file => file.type === documentType)

		for (const file of files) {
			if (file.type === documentType) {
				const pdfLibDocument = await PDFDocument.load(await file.arrayBuffer())


				for (const pdfLibPage of pdfLibDocument.getPages()) {
					addPage({
						id: uuid(),
						pdfLibPage: pdfLibPage,
						previewUrl: await util.pdfLibPageToPngDataUrl(pdfLibPage)
					})
				}
			} else {
				throw new Error('No.')
			}
		}

		event.target.value = null
	}

	const handleDragAndDrop = event => {
		pages = event.detail.items
	}

	const addPage = page => {
		pages = [...pages, page]
	}

	const movePreviousAt = index => {
		if (index !== 0) {
			pages = [
				...pages.slice(0, index - 1),
				pages[index],
				pages[index - 1],
				...pages.slice(index + 1)
			]
		}
	}

	const moveNextAt = index => {
		if (index !== pages.length - 1) {
			pages = [
				...pages.slice(0, index),
				pages[index + 1],
				pages[index],
				...pages.slice(index + 2)
			]
		}

	}

	const removeAt = index => {
		pages = [
			...pages.slice(0, index), ...pages.slice(index + 1)
		]
	}

	const make = async () => {
		const destinationDocument = await PDFDocument.create()

		for (const page of pages) {
			const sourceDocument = page.pdfLibPage.doc
			const index = sourceDocument.getPages().indexOf(page.pdfLibPage)
			const [copiedPage] = await destinationDocument.copyPages(sourceDocument, [index])
			destinationDocument.addPage(copiedPage)
		}

		const buffer = await destinationDocument.save()
		const blob = new Blob([buffer], { type: 'application/pdf' })
		const url = URL.createObjectURL(blob)
		window.open(url, '_blank')
	}
</script>

<main>
	<input type="file" multiple accept={allowedTypes.join(',')} on:change={handleNewFiles}/>

	<div>
		<p>Pages : {pages.length}</p>
		<button on:click={() => make()}>MAKE</button>
	</div>

	<ul use:dndzone="{{ items: pages }}" on:consider={handleDragAndDrop} on:finalize={handleDragAndDrop} class="pages">
		{#each pages as page, index (page.id)}
			<Page
				page={page}
				on:previous={() => movePreviousAt(index)}
				on:next={() => moveNextAt(index)}
				on:remove={() => removeAt(index)}
			></Page>
		{/each}
	</ul>
</main>

<style>
	main {
		background-color: azure;
	}

	.pages {
		display: flex;
		flex-wrap: wrap;
	}
</style>
