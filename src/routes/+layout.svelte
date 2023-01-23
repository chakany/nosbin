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
    let showKeyModal = false;

    export const ssr = false;
    import "../app.postcss";
    import "@fontsource/montserrat";
    import "@fontsource/righteous";
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome'
    import { faNoteSticky, faSun } from '@fortawesome/free-solid-svg-icons'
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
    $nostrInstance.connect()
</script>

<div class="flex mx-20 my-7">
    <!--suppress JSUnresolvedVariable -->
    <div style="font-size: 1.5rem;" class>
        <a style="text-decoration: none;" href="/">
            <FontAwesomeIcon class="my-auto mr-3" size="2xl" icon="{faNoteSticky}"></FontAwesomeIcon>
            <span class="my-auto name" style>nosbin</span>
        </a>
        <!-- svelte-ignore missing-declaration -->
        <small>v{_version_}</small>
    </div>
    <div class="ml-auto flex gap-8">
        <span class="my-auto"><FontAwesomeIcon size="xl" icon="{faSun}"></FontAwesomeIcon></span>
        <Button on:click={() => showKeyModal = true} class="my-auto cursor-pointer">Login</Button>
    </div>
</div>
<div class="container mx-auto px-20">
    {#if showKeyModal}
        <Modal on:close={() => {saveKeys(); showKeyModal = false}}>
            <h2 slot="header">
                Manage Keys
            </h2>

            <div class="flex flex-col gap-5">
                <div class="flex flex-col">
                    Public Key (hex)
                    <Textbox bind:value={pubkey} placeholder="Type your public key..."></Textbox>
                </div>
                <div class="flex flex-col">
                    Private Key (hex)
                    <Textbox bind:value={privkey} placeholder="Type your private key..."></Textbox>
                </div>
                <div class="flex gap-5">
                    <Button on:click="{genKeys}">Generate</Button>
                    <Button on:click="{getPubkeyFromExtension}">Use Extension</Button>
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
        {/if}
    <slot></slot>
</div>
<footer class="mt-40 pb-4">
    <hr>
    <div class="px-12 py-10">
        <div class="grid grid-rows-3 grid-flow-col gap-4">
            <div class="flex gap-4 col-start-1">
                <a class="my-auto" href="https://chaker.net" style="text-decoration: none"><span class="chaker my-auto">Chaker</span></a>
                <a class="my-auto" href="https://github.com/jacany/nosbin"><FontAwesomeIcon size="2xl" icon="{faGithub}"></FontAwesomeIcon></a>
            </div>
            <div class="col-start-2 flex flex-col text-right">
                <small class="my-auto">Made with ❤️ by <a class="underline" href="https://jacany.com">Jack Chakany</a></small>
                <small class="my-auto">This project is published under the <a href="https://github.com/jacany/nosbin/blob/master/LICENSE">GNU Affero General Public License</a></small>
            </div>
        </div>
    </div>
</footer>

<style lang="postcss">
    :global(html) {
        font-size: calc(0.4vw + 0.4vh + 0.4vmin);
    }
    :global(body) {
        font-family: "Montserrat", sans-serif;
        background-color: black;
        color: white;
    }
    :global(a) {
        color: inherit !important;
    }
    small {
        font-size: 0.8em;
    }
    .chaker {
        font-family: "Righteous", cursive;
        font-size: 2em;
        text-decoration: none;
        transition: all 0.3s ease-out;
        background: linear-gradient(
            45deg,
            rgb(64, 64, 64),
            rgb(64, 64, 64)
        );
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
    }
    .chaker:hover {
         color: transparent;
         cursor: pointer;
         background: linear-gradient(
           45deg,
           #f17c58,
           #e94584,
           #24aadb,
           #27dbb1,
           #ffdc18,
           #ff3706
         );
         background-size: 600% 100%;
         animation: gradient 16s linear infinite;
         animation-direction: alternate;
         background-clip: text;
         -webkit-background-clip: text;
     }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>