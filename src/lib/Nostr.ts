/*
 * Nostr.ts
 * Copyright (c) 2023 Jack Chakany <jack@chaker.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
	generatePrivateKey,
	getPublicKey,
	getEventHash,
	signEvent,
	nip19,
} from "nostr-tools/index";
import { browser } from "$app/environment";
import type { Event } from "nostr-tools/index";
import Logger from "$lib/Logger";
import { RelayPool } from "nostr-relaypool/index";

export default class Nostr {
	public relays: RelayPool;
	public _pubkey: string;
	private _privkey: string;
	private _log: Logger;

	constructor() {
		// Bootstrap Relays
		this.relays = new RelayPool([
			"wss://relay.nosbin.com",
			"wss://eden.nostr.land",
			"wss://relay.damus.io",
			"wss://relay.snort.social",
			"wss://relay.current.fyi",
			"wss://nostr.oxtr.dev",
			"wss://atlas.nostr.land",
			"wss://nostr.zebedee.cloud",
			"wss://relay.orangepill.dev",
			"wss://nostr.fmt.wiz.biz",
			"wss://nostr.wine"
		]);
		this._log = new Logger("nostr");
		if (browser) {
			const storedKeys = JSON.parse(localStorage.getItem("keys"));
			this._pubkey = storedKeys ? storedKeys[0] : "";
			this._privkey = storedKeys ? storedKeys[1] : "";
		} else {
			this._pubkey = "";
			this._privkey = "";
		}

		this.relays.onnotice((url, msg) => {
			this._log.info(`NOTICE from ${url} `, msg)
		});

		this.relays.ondisconnect((url, msg) => {
			this._log.warn(`Disconnected from ${url}: `, msg)
		})

		this.relays.onerror((url, msg) => {
			this._log.error(`Error with ${url} `, msg);
		});
	}

	public async nip05(nip05: string, pubkey: string): Promise<boolean> {
		const splitted = nip05.split("@");
		const req = await fetch(
			`https://${splitted[1]}/.well-known/nostr.json?name=${splitted[0]}`
		);
		if (!req.ok) return false;

		const data = await req.json();
		return data.names[splitted[0]] === pubkey;
	}

	//
	// Key Management
	//

	public get pubkey(): string {
		if (!this._pubkey) return "";
		let encoded: string;
		try {
			encoded = nip19.npubEncode(this._pubkey);
		} catch (error) {
			this._log.error(error);
		}
		return encoded;
	}
	public set pubkey(input: string) {
		let key: string = input;
		if (input.startsWith("npub")) {
			try {
				key = nip19.decode(input).data;
			} catch (error) {
				return new Error("Failed to decode npub");
			}
		}

		this._pubkey = key;
		if (browser) localStorage.setItem("keys", JSON.stringify([key, this._privkey]));
		return input;
	}
	public get privkey(): string {
		if (!this._privkey) return "";
		let encoded: string;
		try {
			encoded = nip19.nsecEncode(this._privkey);
		} catch (error) {
			this._log.error(error);
		}
		return encoded;
	}
	public set privkey(input: string) {
		let key: string = input;
		if (input.startsWith("nsec")) {
			try {
				key = nip19.decode(input).data;
			} catch (error) {
				return new Error("Failed to decode nsec");
			}
		}

		this._privkey = key;
		if (browser) localStorage.setItem("keys", JSON.stringify([this._pubkey, key]));
		return input;
	}

	public generateKeys(): string[] {
		const genPriv = generatePrivateKey();
		this.privkey = genPriv;
		this.pubkey = getPublicKey(genPriv);
		return [this.pubkey, this.privkey];
	}

	public async getPubkeyFromExtension(): Promise<string | null> {
		if (browser && !window.nostr) return null;
		this.pubkey = await window.nostr.getPublicKey();
		return this.pubkey;
	}

	public getCurrentRelaysInArray(): string[] {
		return this.relays.getRelayStatuses().map(([url, _]) => url);
	}

	//
	// Event Management
	//
	public async postNewEvent(ev: Event, returnNip19 = false): Promise<string | undefined> {
		let event: Event = {
			...ev,
			pubkey: this._pubkey,
			created_at: Math.floor(Date.now() / 1000),
		};
		event.tags.push(["client", "nosbin"]);
		event.id = getEventHash(event);
		if (browser && window.nostr && this._privkey === "") {
			// assume that we are using nostr extension
			event = await window.nostr.signEvent(event);
			console.debug(event);
		} else {
			event.sig = signEvent(event, this._privkey);
		}
		await this.relays.publish(event, this.getCurrentRelaysInArray());

		if (returnNip19) {
			return nip19.neventEncode({ id: event.id!, relays: this.getCurrentRelaysInArray() })
		}
		return event.id;
	}

	public getEventById(id: string, maxDelayms = 100): Promise<Event> {
		return this.relays.getEventById(id, this.getCurrentRelaysInArray(), maxDelayms);
	}
}
