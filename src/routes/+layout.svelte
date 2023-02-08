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

<script lang="ts">
  import Textbox from "$lib/Textbox.svelte";
  import Button from "$lib/Button.svelte";
  import Modal from "$lib/Modal.svelte";

  let showKeyModal = false;
  let showRelayModal = false;
	let connecting = true;

  export const ssr = false;
  import "@fontsource/montserrat";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faNoteSticky, faUser, faServer } from "@fortawesome/free-solid-svg-icons";
  import { faGithub } from "@fortawesome/free-brands-svg-icons";
  import { config } from "@fortawesome/fontawesome-svg-core";
  import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS
  config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

  // init connection
  import { nostr } from "$lib/store";
  import {onMount} from "svelte";
  import {c} from "svelte-highlight/languages";
  let inputtedPubkey = $nostr.pubkey;
  let inputtedPrivkey = $nostr.privkey;
  let countdown = 10
  setInterval(() => {
	  if (countdown > 0) countdown--
	  else {
		  updateState()
		  countdown = 10
	  }
  }, 1000)

  // used to refresh relay state on update, like when an entry is added and deleted and such.
  function updateState() {
	  nostr.set($nostr)
	  countdown = 10
  }

  // needed because someone decided that nostr-tools relay connect() doesn't need a error handler in any way
  // makes it impossible to catch initial connection errors
  onMount(() => {
	  window.addEventListener("unhandledrejection", () => {});
  })

  let relayField = "";
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
	<a class="align" href="https://github.com/jacany/nosbin">
	  <FontAwesomeIcon size="xl" icon={faGithub} />
	</a>
	<div on:click={() => {showRelayModal = true}} class="align" style="cursor: pointer;">
		<FontAwesomeIcon size="xl" fade={false} icon={faServer} />
	</div>
	<div on:click={() => showKeyModal = true} class="align" style="cursor: pointer;">
	  <FontAwesomeIcon size="xl" icon={faUser} />
	</div>
  </div>
</div>
<div class="container">
  {#if showKeyModal}
	<Modal on:close="{() => {showKeyModal = false}}">
	  <h2 slot="header">
		Manage Keys
	  </h2>

	  <div class="flex column" style="gap: 10px;">
		<div class="flex column">
		  Public Key (bech32 or hex)
		  <Textbox bind:value={inputtedPubkey} placeholder="npub..." />
		</div>
		<div class="flex column">
		  Private Key (bech32 or hex)
		  <Textbox bind:value={inputtedPrivkey} placeholder="nsec..." />
		</div>
		<div class="flex" style="gap: 10px;">
		  <Button on:click={() => [inputtedPubkey, inputtedPrivkey] = $nostr.generateKeys()}>Generate</Button>
		  <Button on:click={async () => { inputtedPubkey = await $nostr.getPubkeyFromExtension(); inputtedPrivkey = "" }}>Use Extension</Button>
		</div>
		<small><i>
		  {#if inputtedPubkey && inputtedPrivkey === ""}
			You will be asked for your Private Key every time you want to sign an event.
		  {:else if inputtedPubkey && inputtedPrivkey}
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
		Refreshing in {countdown}s
	  <div class="flex column" style="gap: 10px;">
		{#each $nostr.relays.getRelayStatuses() as relay}
		  <div class="flex">
			<div class="align" style="margin-right: auto">
			  {#if relay[1] === 0 || relay[1] === 2}
				⚠️
			  {:else if relay[1] === 1}
				✅
			  {:else if relay[1] === 3}
				❌
			  {:else}
				❌
			  {/if}
			  {relay[0]}
			</div>
			<Button class="align" on:click={() =>{ $nostr.relays.removeRelay(relay[0]); updateState() }}>Remove</Button>
		  </div>
		{/each}
		<div class="flex" style="gap: 15px">
		  <Textbox bind:value={relayField} placeholder="wss://"></Textbox>
		  <Button on:click={() => { $nostr.relays.addOrGetRelay(relayField); updateState() }}>Add</Button>
		</div>
	  </div>
	</Modal>
  {/if}
  <slot></slot>
</div>
Made by <a href="https://jacany.com">Jack
  Chakany</a>; Get in contact: npub1s8gvenj9j87yux0raa6j52cq8mer4xrvkv08sd020kxhektdgl4qu7ldqa; This website is licensed under the
<a href="https://github.com/jacany/nosbin/blob/master/LICENSE">AGPL v3.0</a>

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