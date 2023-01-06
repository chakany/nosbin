<script>
    import Textbox from "$lib/Textbox.svelte"
    import { goto } from "$app/navigation"
    import { nostrInstance } from "$lib/store";

    let content;
    let filename;

    $: pubkey = "none"
    $: privkey = "none"
    $: relay = $nostrInstance.relay.url

    function newKeys() {
        const keys = $nostrInstance.genKeys()
        pubkey = keys[0]
        privkey = keys[1]
        relay = $nostrInstance.relay.url
    }

    async function post() {
        if (pubkey == "none" || !content || !filename) return;
        const id = await $nostrInstance.postFile(filename, content)
        console.log(id)
        if (id) {
            await goto(`/${id}`, {replaceState: false})
        }
    }
</script>

<svelte:head>
    <meta name="description" content="The decentralized pasting platform" />
</svelte:head>

<h1>Welcome to nosbin</h1>
<p>The decentralized pasting platform, built on <a href="https://usenostr.org">nostr</a></p>
<b>⚠️THIS APP IS A WORK IN PROGRESS ⚠️</b>
<p>Generated Pubkey: {pubkey}</p>
<p>Generated Private Key: {privkey}</p>
<p>Current Relay: {relay}</p>
<button style="margin-bottom: 10px" on:click={newKeys}>Generate</button>

<div style="display: flex; flex-direction: column; ">
    <Textbox bind:value={filename} type="input" style="width: 15vw; margin-bottom: 2vh" placeholder="README.md" />
    <Textbox bind:value={content} type="textarea" style="height: 50vh;" placeholder="Write your post..." />
</div>

<button style="margin-top: 15px" on:click={post}>Post</button>

<style>
    button {
        background: none;
        color: white;
        border-radius: 6px;
        border-style: solid;
        border-color: #bbbbbb;
        border-width: thin;
        cursor: pointer;
        width:85px;
        height: 35px;
        transition: border-color 0.2s;
    }
    button:hover {
        transition: border-color 0.2s;
        border-color: white;
        outline: none;
    }
</style>