/*
 * Nostr.ts
 * Copyright (c) 2023 Jack Chakany <jacany@chaker.net>
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
    relayInit,
    generatePrivateKey,
    getPublicKey,
    getEventHash,
    signEvent,
    nip19
} from 'nostr-tools/index'
import { browser } from "$app/environment";
import type { Event } from "nostr-tools/index"
import Logger from "$lib/Logger"
import { RelayPool } from "nostr-relaypool";
import {nostr} from "$lib/store";

export class NewNostr {
    public relays: RelayPool
    private _pubkey: string
    private _privkey: string
    private _log: Logger
    private relayUpdateCallback: any;

    constructor(relayUpdateCallback) {
        this.relays = new RelayPool([
            "wss://nostr.chaker.net",
            "wss://eden.nostr.land",
            "wss://relay.damus.io"
        ])
        this.relayUpdateCallback = relayUpdateCallback;
        this._log = new Logger("nostr")
        if (browser) {
            let storedKeys = JSON.parse(localStorage.getItem("keys"))
            this._pubkey = storedKeys ? storedKeys[0] : ""
            this._privkey = storedKeys ? storedKeys[1] : ""
        } else {
            this._pubkey = ""
            this._privkey = ""
        }
    }

    //
    // Key Management
    //

    public get pubkey(): string {
        if (!this._pubkey) return ""
        return nip19.npubEncode(this._pubkey)
    }
    public set pubkey(input: string) {
        let key: string = input
        if(input.startsWith("npub")) {
            try {
                key = nip19.decode(input)
            } catch (error) {
                return new Error("Failed to decode npub")
            }
        }

        this._pubkey = key
        if (browser) localStorage.setItem("keys", JSON.stringify([key, this._privkey]))
    }
    public get privkey(): string {
        if (!this._privkey) return ""
        return nip19.nsecEncode(this._privkey)
    }
    public set privkey(input: string) {
        let key: string = input
        if(input.startsWith("nsec")) {
            try {
                key = nip19.decode(input)
            } catch (error) {
                return new Error("Failed to decode nsec")
            }
        }

        this._privkey = key
        if (browser) localStorage.setItem("keys", JSON.stringify([this._pubkey, key]))
    }

    public generateKeys(): string[] {
        let genPriv = generatePrivateKey()
        this.privkey = genPriv;
        this.pubkey = getPublicKey(genPriv)
        return [this.pubkey, this.privkey]
    }

    public async getPubkeyFromExtension(): Promise<string> {
        if (!window.nostr) return
        this.pubkey = await window.nostr.getPublicKey();
        return this.pubkey
    }

    public getCurrentRelaysInArray(): string[] {
        return this.relays.getRelayStatuses().map(([url, status]) => url);
    }

    //
    // Event Management
    //
    public async postNewEvent(ev: Event): Promise<string> {
        let event: Event = {
            ...ev,
            pubkey: this._pubkey,
            created_at: Math.floor(Date.now() / 1000),
        }
        event.tags.push(["client", "nosbin"])
        event.id = getEventHash(event)
        // @ts-ignore might exist we don't know
        if (browser && window.nostr && this._privkey == "") {
            // assume that we are using nostr extension
            // @ts-ignore
            event = await window.nostr.signEvent(event)
            console.debug(event)
        } else {
            event.sig = signEvent(event, this._privkey)
        }
        await this.relays.publish(event, this.getCurrentRelaysInArray())

        return event.id!
    }
}

export default class Nostr {
    public relays: Relay[]
    public pubkey: string
    public privkey: string;
    public extension: boolean;
    constructor() {
        this.relays = [];
        this.relays[0] = relayInit('wss://nostr.chaker.net');
        this.relays[1] = relayInit('wss://relay.damus.io');
        this.relays[2] = relayInit('wss://nostr.oxtr.dev');
        if (browser && localStorage.getItem("keys")) {
            const keys = JSON.parse(localStorage.getItem("keys")!)
            this.pubkey = keys[0]
            this.privkey = keys[1]
            this.extension = keys[2]
        } else {
            this.pubkey = ""
            this.privkey = ""
            this.extension = false
        }
    }

    public genKeys(): string[] {
        this.privkey = generatePrivateKey()
        this.pubkey = getPublicKey(this.privkey)
        if (browser) localStorage.setItem("keys", JSON.stringify([this.pubkey, this.privkey]))
        return [this.pubkey, this.privkey]
    }

    public setKeys(pub: string, priv: string, extension: boolean) {
        this.pubkey = pub;
        this.privkey = priv
        this.extension = extension
        // also save into localstorage
        if (browser) localStorage.setItem("keys", JSON.stringify([this.pubkey, this.privkey, extension]))
    }

    public async getEvent(id: string): Promise<Event | null> {
        return new Promise<Event |null>((resolve) => {
            let sub = this.relays[0].sub([
                {
                    ids: [id]
                }
            ])
            sub.on('event', (event: Event) => {
                console.debug('we got the event we wanted:', event)
                resolve(event)
            })
            sub.on('eose', () => {
                sub.unsub()
            })
        })
    }

    public async postFile(filename: string, content: string) {

        let event: Event = {
            kind: 1050,
            pubkey: this.pubkey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["filename", filename],
                ["client", "nosbin"]
            ],
            content: content
        }
        event.id = getEventHash(event)
        // @ts-ignore might exist we don't know
        if (browser && window.nostr && this.privkey == "" && this.extension) {
            // assume that we are using nostr extension
            // @ts-ignore
            event = await window.nostr.signEvent(event)
            console.debug(event)
        } else {
            event.sig = signEvent(event, this.privkey)
        }

        for (let relay of this.relays) {
            let pub = relay.publish(event)
            pub.on('ok', () => {
                console.debug(`${relay.url} has accepted our event`)
            })
            pub.on('seen', () => {
                console.debug(`we saw the event on ${relay?.url}`)
            })
            pub.on('failed', (reason: any) => {
                console.error(`failed to publish to ${relay.url}: ${reason}`)
            })
        }

        return event.id
    }
}