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
    import 'bootstrap/dist/css/bootstrap.min.css';
    import "@fontsource/montserrat";
    import "@fontsource/righteous";
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome'
    import { faNoteSticky, faSun } from '@fortawesome/free-solid-svg-icons'
    import { faGithub } from "@fortawesome/free-brands-svg-icons";
    import { config } from '@fortawesome/fontawesome-svg-core'
    import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
    import { Container, Row, Col, ListGroup, ListGroupItem } from "sveltestrap";

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

<div class="header">
    <!--suppress JSUnresolvedVariable -->
    <div style="font-size: 1.5rem;" class="align">
        <a style="text-decoration: none;" href="/">
            <FontAwesomeIcon class="align" style="margin-right: 6px" size="2xl" icon={faNoteSticky} />
            <span class="align name" style="">nosbin</span>
        </a>
        <!-- svelte-ignore missing-declaration -->
        <small>v{_version_}</small>
    </div>
    <div class="align flex" style="margin-left: auto; gap: 20px;">
        <span class="align"><FontAwesomeIcon size="xl" icon={faSun} /></span>
        <Button on:click={() => showKeyModal = true} class="align" style="cursor: pointer;">Login</Button>
    </div>
</div>
<Container>
    {#if showKeyModal}
        <Modal on:close="{() => {saveKeys(); showKeyModal = false}}">
            <h2 slot="header">
                Manage Keys
            </h2>

            <div class="flex column" style="gap: 10px;">
                <div class="flex column" >
                    Public Key (hex)
                    <Textbox bind:value={pubkey} placeholder="Type your public key..." />
                </div>
                <div class="flex column" >
                    Private Key (hex)
                    <Textbox bind:value={privkey} placeholder="Type your private key..." />
                </div>
                <div class="flex" style="gap: 10px">
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
        {/if}
    <slot></slot>
</Container>
<footer style="margin-top: 10vh; padding-bottom: 1vh">
    <hr />
    <div style="background-color: black; padding: 1vh 3vw;">
        <Row>
            <Col style="margin: auto 0; display: flex; gap: 1vw">
                <a class="align" href="https://chaker.net" style="text-decoration: none"><span class="chaker align">Chaker</span></a>
                <a class="align" href="https://github.com/jacany/nosbin"><FontAwesomeIcon size="2xl" icon={faGithub} /></a>
            </Col>
            <Col style="text-align: right; margin: auto 0;">
                <div class="align flex column">
                    <small class="align">Made with ❤️ by Jack Chakany</small>
                    <small class="align">This project is published under the <a href="https://github.com/jacany/nosbin/blob/master/LICENSE">GNU Affero General Public License</a></small>
                </div>
            </Col>
        </Row>
    </div>
</footer>

<style lang="scss">
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

        &:hover {
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