import {writable} from "svelte/store";
import Nostr from "$lib/Nostr"
export const nostrInstance = writable(new Nostr())
