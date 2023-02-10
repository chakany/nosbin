<!--
  - +page.svelte
  - Copyright (c) 2023 Jack Chakany <jacany@chaker.net>
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->
<script>
	import Textbox from "$lib/Textbox.svelte";
	import Button from "$lib/Button.svelte";
	import { goto } from "$app/navigation";
	import { nostr } from "$lib/store";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";
	import SvelteMarkdown from "svelte-markdown";
	import github from "svelte-highlight/styles/github-dark";
	import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
	import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
	import { KeyModal } from "$lib/ModalController";

	let content;
	let filename;
	let previewMode = false;

	async function post() {
		if (!filename) {
			alert("You must add a filename!");
			return;
		} else if (!content) {
			alert("You must add content to post!");
			return;
		} else if ($nostr.pubkey === "") {
			KeyModal.set(true);
			return;
		}
		const id = await $nostr.postNewEvent({
			kind: 1050,
			tags: [["filename", filename]],
			content: content,
		});
		console.log(id);
		if (id) {
			await goto(`/${id}`, { replaceState: false });
		}
	}
</script>

<svelte:head>
	<title>Home - nosbin</title>
	<meta property="og:title" content="Home - nosbin" />
	<meta name="description" content="the decentralized pasting platform, built on nostr" />
	<meta property="og:description" content="the decentralized pasting platform, built on nostr" />
	{@html github}
</svelte:head>

<h1>Welcome to nosbin</h1>
<p>
	The original decentralized pasting platform, built on <a href="https://usenostr.org">nostr</a>
</p>

<div class="flex flex-col">
	<div id="editbox" class="flex flex-col">
		<div class="m-3 flex">
			<Textbox
				class="my-auto w-28"
				bind:value={filename}
				type="input"
				placeholder="README.md"
			/>
			<div
				title="Preview"
				on:click={() => (previewMode = !previewMode)}
				class="my-auto mr-auto ml-5 flex cursor-pointer"
			>
				{#if previewMode}
					<FontAwesomeIcon class="my-auto" size="l" icon={faEye} />
				{:else}
					<FontAwesomeIcon class="my-auto" size="l" icon={faEyeSlash} />
				{/if}
			</div>
		</div>
		{#if previewMode}
			{#if filename.endsWith(".md")}
				<div class="my-2 mx-4" style="height: 50vh;">
					<SvelteMarkdown source={content} />
				</div>
			{:else}
				<div style="height: 50vh;">
					<HighlightAuto code={content} let:highlighted>
						<LineNumbers {highlighted} hideBorder wrapLines />
					</HighlightAuto>
				</div>
			{/if}
		{:else}
			<Textbox
				bind:value={content}
				type="textarea"
				style="height: 50vh;"
				placeholder="Write your paste..."
			/>
		{/if}
	</div>
</div>

<div class="mt-3">
	<Button on:click={post}>Post</Button>
	<small
		>Make sure you inputted or generated your keys before attempting to post! Click the profile
		icon in the top right to get started.</small
	>
</div>

<style>
	#editbox {
		border-radius: 0.25rem;
		border-style: solid;
		border-color: #bbbbbb;
		border-width: thin;
	}
</style>
