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
    import Textbox from "$lib/Textbox.svelte"
    import Button from "$lib/Button.svelte"
    import { goto } from "$app/navigation"
    import { nostrInstance } from "$lib/store";

    let content;
    let filename;

    $: relay = $nostrInstance.relay.url

    async function post() {
        if ($nostrInstance.pubkey === "" || !content || !filename) return;
        const id = await $nostrInstance.postFile(filename, content)
        console.log(id)
        if (id) {
            await goto(`/${id}`, {replaceState: false})
        }
    }
</script>

<svelte:head>
    <title>Home - nosbin</title>
    <meta property="og:title" content="Home - nosbin" />
    <meta name="description" content="the decentralized pasting platform, built on nostr" />
    <meta property="og:description" content="the decentralized pasting platform, built on nostr" />
</svelte:head>

<h1>Welcome to nosbin</h1>
<p>The decentralized pasting platform, built on <a href="https://usenostr.org">nostr</a></p>
<b>⚠️THIS APP IS A WORK IN PROGRESS ⚠️</b>
<p>Current Relay: {relay}</p>

<div style="display: flex; flex-direction: column; ">
    <Textbox bind:value={filename} type="input" style="width: 15vw; margin-bottom: 2vh" placeholder="README.md" />
    <Textbox bind:value={content} type="textarea" style="height: 50vh;" placeholder="Write your post..." />
</div>

<Button style="margin-top: 15px" on:click={post}>Post</Button>
<small>Make sure you inputted or generated your keys before attempting to post! Click the profile icon in the top right to get started.</small>
