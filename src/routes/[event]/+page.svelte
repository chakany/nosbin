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
    import { page } from "$app/stores";
    import { HighlightAuto, LineNumbers } from "svelte-highlight";
    import SvelteMarkdown from "svelte-markdown";
    import github from "svelte-highlight/styles/github-dark";
    let event;
    let hasData = false;
    let content = ""

    // fetch
    async function fetch() {
        console.debug($page.params.event)
        event = await $nostr.getEvent({
          ids: [$page.params.event],
          kinds: [1050],
        })
        hasData = true
    }
</script>
<svelte:head>
  <title>paste {$page.params.event} - nosbin</title>
  <meta name="description" content="view this paste on nosbin, the decentralized pasting platform" />
  <meta property="og:description" content="view this paste on nosbin, the decentralized pasting platform" />
  <meta property="og:title" content="paste {$page.params.event}" />
  {@html github}
</svelte:head>

{#if hasData}
  <h2>{event?.tags[0][1]}</h2>
  Posted by: {event.pubkey} <br />
  Posted on: {new Date(event.created_at * 1000)}
  {#if event?.tags[0][1].endsWith(".md")}
    <SvelteMarkdown source={event.content} />
    {:else}
    <HighlightAuto code={event.content} let:highlighted>
      <LineNumbers {highlighted} hideBorder wrapLines />
    </HighlightAuto>
  {/if}
  {:else}
  <h2>Fetching...</h2>
  If data doesn't load, try refreshing.
  <button on:click={fetch}>Fetch</button>
{/if}
