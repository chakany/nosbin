<!--
  - +layout.svelte
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
    import Modal from "$lib/Modal.svelte"
    import {relayInit} from "nostr-tools";

    let showKeyModal = false;
    let showRelayModal = false;

    export const ssr = false;
    import "@fontsource/montserrat";
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome'
    import { faNoteSticky, faUser, faServer, faXmark } from '@fortawesome/free-solid-svg-icons'
    import { faGithub } from "@fortawesome/free-brands-svg-icons";
    import { config } from '@fortawesome/fontawesome-svg-core'
    import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
    config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

    // init connection
    import { nostrInstance } from "$lib/store";
    let pubkey = $nostrInstance.pubkey
    let privkey = $nostrInstance.privkey
    let extension = $nostrInstance.extension

    function genKeys() {
        const keys = $nostrInstance.genKeys();
        console.log(keys)
        pubkey = keys[0];
        privkey = keys[1];
        extension = false
    }
    async function getPubkeyFromExtension() {
        console.debug('window.nostr not detected')
        if (!window.nostr) return;
        pubkey = await window.nostr.getPublicKey();
        privkey = ""
        extension = pubkey !== ""
    }
    function saveKeys() {
        $nostrInstance.setKeys(pubkey, privkey, extension)
    }

    let relays = $nostrInstance.relays
    let relayField = ""
    $nostrInstance.relays.forEach(async (relay) => {
        connect(relay)
    })

    async function connect(relay) {
        try {
            await relay.connect()
        } catch (err) {
            relays = $nostrInstance.relays
        }

        relay.on("connect", () => {
            relays = $nostrInstance.relays
            console.debug(`Connected to ${relay.url}`)
        })
        relay.on("error", (error) => {
            relays = $nostrInstance.relays
            console.error(error)
        })
        relay.on("disconnect", () => {
            relays = $nostrInstance.relays
            console.debug(`Disconnected from ${relay.url}`)
        })
    }

    async function addRelay() {
        // publish nostr event adding relay
        try {
            new URL(relayField)
        } catch {
            return
        }
        const relay = relayInit(relayField)
        $nostrInstance.relays.push(relay)
        connect(relay)
        relays = $nostrInstance.relays
        console.debug(`Added ${relay.url} to relay list`)
    }

    async function removeRelay(relay) {
        // publish nostr event removing relay
        const i = $nostrInstance.relays.indexOf(relay)
        if ($nostrInstance.relays[i].status === 1) await $nostrInstance.relays[i].close()
        $nostrInstance.relays.splice(i, 1)
        relays = $nostrInstance.relays
        console.debug(`Removed ${relay.url} from relay list`)
    }
</script>

<div class="header">
    <!--suppress JSUnresolvedVariable -->
    <div class="align">
        <a style="text-decoration: none;" href="/">
            <FontAwesomeIcon class="align" style="margin-right: 6px" size="2xl" icon={faNoteSticky} />
            <span class="align" id="name">nosbin</span>
        </a>
        <!-- svelte-ignore missing-declaration -->
        v{_version_}
    </div>
    <div class="align flex" style="margin-left: auto; gap: 20px;">
        <span class="align"></span>
        <a class="align" href="https://github.com/jacany/nosbin"><FontAwesomeIcon size="xl" icon={faGithub} /></a>
        <div class="flex align" style="gap: 8px">
            <span class="align">{relays.filter((relay) => relay.status === 1).length}/{relays.length}</span>
            <div on:click={() => showRelayModal = true} class="align" style="cursor: pointer;">
                <FontAwesomeIcon size="xl" icon={faServer} />
            </div>
        </div>
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
                    Public Key (hex)
                    <Textbox bind:value={pubkey} placeholder="31g3..." />
                </div>
                <div class="flex column" >
                    Private Key (hex)
                    <Textbox bind:value={privkey} placeholder="5fc3..." />
                </div>
                <div class="flex" style="gap: 10px;">
                    <Button on:click={genKeys}>Generate</Button>
                    <Button on:click={getPubkeyFromExtension}>Use Extension</Button>
                </div>
                <small><i>
                    {#if pubkey && privkey === ""}
                        You will be asked for your Private Key every time you want to sign an event.
                    {:else if pubkey && privkey}
                        Events will be signed automatically using the stored private key
                    {/if}
                </i></small>
            </div>
        </Modal>
        {:else if showRelayModal}
        <Modal on:close="{() => {showRelayModal = false}}">
            <h2 slot="header">
                Manage Relays
            </h2>

            <div class="flex column" style="gap: 10px;">
                {#each relays as relay}
                    <div class="flex">
                        <div class="align" style="margin-right: auto">
                            {#if relay.status === 0 || relay.status === 2}
                                ⚠️
                            {:else if relay.status === 1}
                                ✅
                            {:else if relay.status === 3}
                                ❌
                            {:else}
                                ❌
                            {/if}
                            {relay.url}
                        </div>
                        <Button class="align" on:click={() => removeRelay(relay)}>Remove</Button>
                    </div>
                    {/each}
                <div class="flex" style="gap: 15px">
                    <Textbox bind:value={relayField} placeholder="wss://"></Textbox>
                    <Button on:click={addRelay}>Add</Button>
                </div>
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