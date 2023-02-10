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
	import { nostr } from "$lib/store";
	import { nip19 } from "nostr-tools/index";
	import { Author } from "nostr-relaypool/index";
	import { page } from "$app/stores";
	import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
	import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";
	import SvelteMarkdown from "svelte-markdown";
	import githubDark from "svelte-highlight/styles/github-dark";
	import github from "svelte-highlight/styles/github";
	import { browser } from "$app/environment";

	let darkMode = true;
	if (browser) {
		const query = window.matchMedia("(prefers-color-scheme: dark)")
		darkMode = query.matches

		query.addEventListener("change", e => darkMode = e.matches);
	}

	const event = $nostr.getEventById($page.params.event, 1000);
	let author = null;
	let profile = {};

	function getAuthor(data) {
		author = new Author($nostr.relays, $nostr.getCurrentRelaysInArray(), data.pubkey);
		author.metaData((ev) => {
			const parsed = JSON.parse(ev.content);
			if (!parsed.name) return;
			console.log(parsed);

			profile = parsed;
		}, 1000);
	}
</script>

<svelte:head>
	<title>paste {$page.params.event} - nosbin</title>
	<meta
		name="description"
		content="view this paste on nosbin, the decentralized pasting platform"
	/>
	<meta
		property="og:description"
		content="view this paste on nosbin, the decentralized pasting platform"
	/>
	<meta property="og:title" content="paste {$page.params.event}" />
	{#if darkMode}
		{@html githubDark}
	{:else}
		{@html github}
	{/if}
</svelte:head>

{#await event}
	<h2>Fetching...</h2>
	If data doesn't load, try refreshing.
{:then data}
	{void getAuthor(data) || ""}
	<h2 class="text-6xl">{data?.tags[0][1]}</h2>
	<div class="flex mt-5">
		<img
			class="my-auto w-12 rounded"
			src={profile.picture ?? `https://robohash.org/${data.pubkey}?sets=1`}
			alt="Profile Picture"
		/>
		<div class="flex flex-col my-auto pl-3">
			<span>{profile.display_name ?? profile.name ?? nip19.npubEncode(data.pubkey)}</span>
			<span>
				{profile.nip05 ?? ""}
				{#if profile.nip05}
					{#await $nostr.nip05(profile.nip05, data.pubkey) then valid}
						{#if valid}
							<FontAwesomeIcon icon={faCheck} />
						{:else if !valid}
							<FontAwesomeIcon icon={faX} />
						{/if}
					{:catch error}
						<FontAwesomeIcon icon={faX} />
					{/await}
				{/if}
			</span>
		</div>
	</div>
	<br />
	Posted on: {new Date(data.created_at * 1000)}
	{#if data?.tags[0][1].endsWith(".md")}
		<SvelteMarkdown source={data.content} />
	{:else}
		<HighlightAuto code={data.content} let:highlighted>
			<LineNumbers {highlighted} hideBorder wrapLines />
		</HighlightAuto>
	{/if}
{:catch error}
	<span>error</span>
{/await}
