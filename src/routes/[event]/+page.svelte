<!--
  - +page.svelte
  - Copyright (c) 2023 Jack Chakany <jack@chaker.net>
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
<script lang="ts">
	import { nostr } from "$lib/store";
	import { nip19, type Event } from "nostr-tools";
	import { Author } from "nostr-relaypool/index";
	import Button from "$lib/Button.svelte";
	import { page } from "$app/stores";
	import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
	import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";
	import SvelteMarkdown from "svelte-markdown";
	import githubDark from "svelte-highlight/styles/github-dark";
	import github from "svelte-highlight/styles/github";
	import { browser } from "$app/environment";
	import Reaction from "$lib/Reaction.svelte"

	let darkMode = true;
	if (browser) {
		const query = window.matchMedia("(prefers-color-scheme: dark)")
		darkMode = query.matches

		query.addEventListener("change", e => darkMode = e.matches);
	}

	let id = $page.params.event
	let idData;
	if ($page.params.event.startsWith("nevent")) {
		idData = nip19.decode($page.params.event)
		id = idData.data.id
		if (idData.data.relays) {
			idData.data.relays.forEach((relay) => {
				$nostr.relays.addOrGetRelay(relay)
			})
		}
	}

	const event = $nostr.getEventById(id, 1000);
	let author = null;
	let profile = {};

	function getAuthor(data) {
		author = new Author($nostr.relays, $nostr.getCurrentRelaysInArray(), data.pubkey);
		author.metaData((ev) => {
			const parsed = JSON.parse(ev.content);
			if (!parsed.name) return;

			profile = parsed;
		}, 1000);
	}

	function download(data) {
		if (browser) {
			let element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.content));
			element.setAttribute('download', data.tags.find((t) => t[0] === "filename")[1]);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		}
	}

	let reactions: Event[] = [];

	let unsubFromReactions = $nostr.sub(
		[
			{
				kinds: [7],
				"#e": [id]
			}
		],
		(event) => {
			reactions = [...reactions, event];
			console.log(reactions)
		},
	)
	function postReaction(reaction: string): string {
		if (reactions.find((v: Event) => v.pubkey === $nostr._pubkey)) {
			return "";
		}
		const event = {
			kind: 7,
			tags: [
					["e", id]
			],
			content: reaction,
		}
		return $nostr.postNewEvent(event)
	}
</script>

<svelte:head>
	<title>paste {$page.params.event}</title>
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
	<div class="flex flex-col gap-3 text-center mt-16">
		<h1 class="text-6xl">Fetching...</h1>
		If data doesn't load, try refreshing.
	</div>
{:then data}
	{void getAuthor(data) || ""}
	<div class="flex">
		<h2 class="my-auto text-6xl">{data?.tags.find((t) => t[0] === "filename")[1]}</h2>
		<span class="my-auto ml-auto"><Button on:click={() => download(data)}>Download</Button></span>
	</div>
	<div class="flex mt-5">
		<img
			class="my-auto w-12 rounded"
			src={profile.picture ?? `https://robohash.org/${data.pubkey}?sets=1`}
			alt="Profile Picture"
		/>
		<div class="flex flex-col my-auto pl-3">
			<span>{profile.display_name ?? profile.name ?? nip19.npubEncode(data.pubkey)} <small>{profile.display_name || profile.name ? nip19.npubEncode(data.pubkey) : ""}</small></span>
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
	{#if data?.tags.find((t) => t[0] === "filename")[1].endsWith(".md")}
		<SvelteMarkdown source={data.content} />
	{:else}
		<HighlightAuto code={data.content} let:highlighted>
			<LineNumbers {highlighted} hideBorder wrapLines />
		</HighlightAuto>
	{/if}
	<div class="flex mt-5">
		<span on:click={() => postReaction("+")} class="mr-2 my-auto">
			<Reaction pubkey={$nostr._pubkey} events={reactions.filter((r) => r.content === "+" || r.content === "👍" || r.content === "❤️" || r.content === "🤙")} emoji="👍" />
		</span>
		<span on:click={() => postReaction("-")} class="mr-2 my-auto">
			<Reaction pubkey={$nostr._pubkey} events={reactions.filter((r) => r.content === "-" || r.content === "👎" || r.content === "💔️")} emoji="👎" />
		</span>
	</div>
{:catch error}
	<span>error</span>
{/await}