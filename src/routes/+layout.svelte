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
	import { KeyModal, RelayModal } from "$lib/ModalController";
	import { Author } from "nostr-relaypool/index";

	export const ssr = false;
	import "../app.postcss";
	import "@fontsource/montserrat";
	import "@fontsource/righteous";
	import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
	import { faNoteSticky, faServer } from "@fortawesome/free-solid-svg-icons";
	import { faGithub } from "@fortawesome/free-brands-svg-icons";
	import { config } from "@fortawesome/fontawesome-svg-core";
	import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS

	config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

	// init connection
	import { nostr } from "$lib/store";
	import { onMount } from "svelte";
	let inputtedPubkey = $nostr.pubkey;
	let inputtedPrivkey = $nostr.privkey;
	let account = new Author($nostr.relays, $nostr.getCurrentRelaysInArray(), $nostr._pubkey);
	let profile = {};
	account.metaData((event) => {
		updateProfile(event);
	}, 1000);
	let countdown = 10;
	setInterval(() => {
		if (countdown > 0) countdown--;
		else {
			updateState();
			countdown = 10;
		}
	}, 1000);

	// used to refresh relay state on update, like when an entry is added and deleted and such.
	function updateState() {
		nostr.set($nostr);
		countdown = 10;
	}

	function updateProfile(event) {
		let data = JSON.parse(event.content);
		if (!data.name) return;
		console.log(data.picture);

		profile = data;
	}

	function saveKeys() {
		$nostr.pubkey = inputtedPubkey;
		$nostr.privkey = inputtedPrivkey;
		account = new Author($nostr.relays, $nostr.getCurrentRelaysInArray(), $nostr._pubkey);
		profile = {};
		account.metaData((event) => {
			updateProfile(event);
		}, 1000);
	}

	// needed because someone decided that nostr-tools relay connect() doesn't need a error handler in any way
	// makes it impossible to catch initial connection errors
	onMount(() => {
		window.addEventListener("unhandledrejection", () => {});
	});

	function updateRelays() {
		try {
			let unsub = $nostr.relays.subscribe(
				[
					{
						authors: [$nostr._pubkey],
						kinds: [3],
					},
				],
				$nostr.getCurrentRelaysInArray(),
				(event) => {
					if (!event.content) return;
					let returnedRelays = JSON.parse(event.content);
					let currentRelays = $nostr.getCurrentRelaysInArray();

					let returnedKeys = Object.keys(returnedRelays);
					returnedKeys.forEach((value) => {
						if (!currentRelays.includes(value)) $nostr.relays.addOrGetRelay(value);
					});
					currentRelays.forEach((value) => {
						if (!returnedKeys.includes(value) && value !== "wss://relay.nosbin.com")
							$nostr.relays.removeRelay(value);
					});
					unsub();
					updateRelays();
				},
				1000,
				undefined,
				{ allowOlderEvents: true }
			);
		} catch (error) {}
	}

	if ($nostr._pubkey) updateRelays();
</script>

<div class="mx-10 md:mx-20 my-7 flex">
	<!--suppress JSUnresolvedVariable -->
	<div class="my-auto">
		<a class="text-xl md:text-2xl" style="text-decoration: none;" href="/">
			<FontAwesomeIcon class="my-auto mr-1" size="2xl" icon={faNoteSticky} />
			<span class="name my-auto" style>nosbin</span>
		</a>
	</div>
	<div class="ml-auto my-auto flex gap-8">
		<span on:click={() => RelayModal.set(true)} class="my-auto cursor-pointer">
			<FontAwesomeIcon size="xl" fade={false} icon={faServer} />
		</span>

		{#if inputtedPubkey}
			<img
				on:click={() => KeyModal.set(true)}
				class="my-auto w-12 cursor-pointer rounded"
				src={profile.picture
					? profile.picture
					: `https://robohash.org/${$nostr._pubkey}?sets=1`}
				alt="Profile Picture"
			/>
		{:else}
			<Button on:click={() => KeyModal.set(true)}>Login</Button
			>
		{/if}
	</div>
</div>
<div class="container mx-auto md:px-20">
	{#if $KeyModal}
		<Modal
			on:close={() => {
				saveKeys();
				KeyModal.set(false);
			}}
		>
			<h2 class="text-2xl" slot="header">Manage Keys</h2>

			<div class="flex flex-col gap-5">
				<div class="flex flex-col">
					Public Key (npub or hex)
					<Textbox bind:value={inputtedPubkey} placeholder="Type your public key..." />
				</div>
				<div class="flex flex-col">
					Private Key (nsec or hex)
					<Textbox bind:value={inputtedPrivkey} placeholder="Type your private key..." />
				</div>
				<div>
					<Button
						on:click={() => ([inputtedPubkey, inputtedPrivkey] = $nostr.generateKeys())}
						>Generate</Button
					>
					<Button
						on:click={async () => {
							inputtedPubkey = await $nostr.getPubkeyFromExtension();
							inputtedPrivkey = "";
						}}>NIP-07</Button
					>
				</div>
				<small
					><i>
						{#if inputtedPubkey && inputtedPrivkey === ""}
							You will be asked for your Private Key every time you want to sign an
							event.
						{:else if inputtedPubkey && inputtedPrivkey}
							Events will be signed automatically using the stored private key
						{/if}
					</i></small
				>
			</div>
		</Modal>
	{:else if $RelayModal}
		<Modal on:close={() => RelayModal.set(false)}>
			<div slot="header">
				<h2 class="text-2xl">View Relays</h2>
				<span>Refreshing in {countdown}s</span>
			</div>
			<div class="flex flex-col" style="gap: 10px;">
				{#each $nostr.relays.getRelayStatuses() as relay}
					<div class="flex">
						<div class="my-auto mr-auto">
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
					</div>
				{/each}
			</div>
			<small
			>If your relays aren't appearing, make sure you added your pubkey and then
				refresh the page</small
			>
		</Modal>
	{/if}
	<slot />
</div>
<footer class="mt-40">
	<hr />
	<div class="px-2 md:px-12 py-10">
		<div class="grid grid-flow-col grid-rows-1 gap-4">
			<div class="col-start-1 flex gap-4">
				<a class="my-auto" href="https://chaker.net" style="text-decoration: none"
					><span class="chaker my-auto">Chaker</span></a
				>
				<a class="my-auto" title="nosbin GitHub" href="https://github.com/jacany/nosbin"
					><FontAwesomeIcon size="2xl" icon={faGithub} /></a
				>
			</div>
			<div class="col-start-2 flex flex-col text-right">
				<small class="my-auto"
					>Made with ❤️ by <a class="underline" href="https://jacany.com">Jack Chakany</a
					></small
				>
				<small class="my-auto">
					npub1s8gvenj9j87yux0raa6j52cq8mer4xrvkv08sd020kxhektdgl4qu7ldqa
				</small>
				<small class="my-auto"
					>This project is published under the <a
						href="https://github.com/jacany/nosbin/blob/master/LICENSE"
						>GNU Affero General Public License</a
					></small
				>
			</div>
		</div>
	</div>
</footer>

<style lang="postcss">
	:global(html) {
		@apply text-base;
	}
	:global(body) {
		font-family: "Montserrat", sans-serif;
		@apply bg-white text-black dark:bg-black dark:text-white;
	}
	:global(a) {
		color: inherit !important;
	}
	:global(small) {
		@apply text-xs;
	}
	.chaker {
		font-family: "Righteous", cursive;
		font-size: 2em;
		text-decoration: none;
		transition: all 0.3s ease-out;
		background: linear-gradient(45deg, rgb(64, 64, 64), rgb(64, 64, 64));
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
	}
	.chaker:hover {
		color: transparent;
		cursor: pointer;
		background: linear-gradient(45deg, #f17c58, #e94584, #24aadb, #27dbb1, #ffdc18, #ff3706);
		background-size: 600% 100%;
		animation: gradient 16s linear infinite;
		animation-direction: alternate;
		background-clip: text;
		-webkit-background-clip: text;
	}

	@keyframes gradient {
		0% {
			background-position: 0 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0 50%;
		}
	}
</style>
