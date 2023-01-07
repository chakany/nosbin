<script>
    import Textbox from "$lib/Textbox.svelte";
    import Button from "$lib/Button.svelte";
    import Modal from "$lib/Modal.svelte"
    let showKeyModal = false;

    export const ssr = false;
    import "@fontsource/montserrat";
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome'
    import { faNoteSticky, faUser } from '@fortawesome/free-solid-svg-icons'
    import { faGithub } from "@fortawesome/free-brands-svg-icons";
    import { config } from '@fortawesome/fontawesome-svg-core'
    import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
    config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

    // init connection
    import { nostrInstance } from "$lib/store";
    $: pubkey = $nostrInstance.pubkey
    $: privkey = $nostrInstance.privkey

    function genKeys() {
        const keys = $nostrInstance.genKeys();
        console.log(keys)
        pubkey = keys[0];
        privkey = keys[1];
    }
    function saveKeys() {
        $nostrInstance.setKeys(pubkey, privkey)
    }
    $nostrInstance.connect()
</script>

<div class="header">
    <div class="align">
        <a style="text-decoration: none;" href="/">
            <FontAwesomeIcon class="align" style="margin-right: 6px" size="2xl" icon={faNoteSticky} />
            <span class="align" id="name">nosbin</span>
        </a>
    </div>
    <div class="align flex" style="margin-left: auto; gap: 20px;">
        <span class="align"></span>
        <a class="align" href="https://github.com/jacany/nosbin"><FontAwesomeIcon size="xl" icon={faGithub} /></a>
        <div on:click={() => showKeyModal = true} class="align" style="cursor: pointer;">
            <FontAwesomeIcon size="xl" icon={faUser} />
        </div>
    </div>
</div>
<div class="container">
    {#if showKeyModal}
        <Modal on:close="{() => {saveKeys(); showKeyModal = false}}">
            <h2 slot="header">
                Manage Keys
            </h2>

            <div class="flex column" style="gap: 10px;">
                <div class="flex column" >
                    Public Key
                    <Textbox bind:value={pubkey} placeholder="npub..." />
                </div>
                <div class="flex column" >
                    Private Key
                    <Textbox bind:value={privkey} placeholder="nsec..." />
                </div>
                <div class="flex" style="gap: 10px;">
                    <Button on:click={genKeys}>Generate</Button>
                </div>
                <small><i>
                    {#if pubkey && privkey == ""}
                        You will be asked for your Private Key every time you want to sign an event.
                    {:else if pubkey && privkey}
                        Events will be signed automatically using the stored private key
                    {/if}
                </i></small>
            </div>
        </Modal>
        {/if}
    <slot></slot>
</div>
Made by <a href="https://jacany.com">Jack Chakany</a>; Get in contact: npub1s8gvenj9j87yux0raa6j52cq8mer4xrvkv08sd020kxhektdgl4qu7ldqa; This website is licensed under the <a href="https://github.com/jacany/nosbin/blob/master/LICENSE">AGPL v3.0</a>

<style>
    :global(body) {
        font-family: "Montserrat", sans-serif;
        background-color: #111111;
        color: white;
    }
    :global(a) {
        color: white;
    }
    .header {
        display: flex;
        margin: 20px 5vw
    }
    .flex {
        display: flex;
    }
    .column {
        flex-direction: column;
    }
    .align {
        margin-top: auto;
        margin-bottom: auto;
    }
    #name {
        font-size: 1.5em;
    }
    .container {
        margin: 3vh 5vw;
    }
</style>