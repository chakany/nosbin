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

import "websocket-polyfill"
import {
    relayInit,
    generatePrivateKey,
    getPublicKey,
    getEventHash,
    signEvent,
    nip19
} from 'nostr-tools/index'
import { browser } from "$app/environment";
import type { Relay, Event, Sub } from "nostr-tools/index"
import Logger from "$lib/Logger"

export class NewNostr {
    public relays: Map<string, Relay>
    public subs: Map<string, Map<string, Sub>>
    private _pubkey: string
    private _privkey: string
    private _log: Logger

    constructor() {
        this.relays = new Map()
        this.subs = new Map()
        if (browser) {
            let storedKeys = JSON.parse(localStorage.getItem("keys"))
            this._pubkey = storedKeys ? storedKeys[0] : ""
            this._privkey = storedKeys ? storedKeys[1] : ""
        } else {
            this._pubkey = ""
            this._privkey = ""
        }
        this._log = new Logger("nostr")
        this.addRelay(`wss://nostr.chaker.net`)
        this.addRelay(`wss://relay.damus.io`)
        this.addRelay("wss://nostr.fmt.wiz.biz")
        this.addRelay("wss://nostr.oxtr.dev")
        this.addRelay("wss://nostr.v0l.io")
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

    //
    // Relay Management
    //

    public async connectAll() {
        for (let [_, relay] of this.relays) {
            this._bindToRelayEmitters(relay)
            try {
                relay.connect()
            } catch (err) {
                console.error(`unable to connect to ${relay.url}: ` + err)
            }
        }
    }

    public connectOne(relayUrl: string): Relay {
        const relay = this.relays.get(relayUrl)
        this._bindToRelayEmitters(relay)
        try {
            relay.connect()
        } catch (err) {
            console.error(`unable to connect to ${relay.url}: ` + err)
        }
        return relay
    }

    private _bindToRelayEmitters(relay: Relay) {
        relay.on("connect", () => {
            this._log.debug(`Connected to ${relay.url}`)
        })
        relay.on("error", (error) => {
            this._log.error(error)
        })
        relay.on("disconnect", () => {
            this._log.debug(`Disconnected from ${relay.url}`)
        })
    }

    public disconnectOne(relayUrl: string): Promise<void> {
        const relay = this.relays.get(relayUrl)
        return relay.close()
    }

    public addRelay(relayUrl: string): Map<string, Relay> {
        return this.relays.set(relayUrl, relayInit(relayUrl));
    }

    public removeRelay(relayUrl: string) {
        this.relays.delete(relayUrl)
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
        if (browser && window.nostr && this._privkey == "" && this.extension) {
            // assume that we are using nostr extension
            // @ts-ignore
            event = await window.nostr.signEvent(event)
            console.debug(event)
        } else {
            event.sig = signEvent(event, this._privkey)
        }
        await this._broadcastToAll(event)

        return event.id!
    }

    private async _broadcastToAll(event: Event): Promise<void> {
        const allRelays = [...this.relays].map(([_, relay]) => relay)
        const connectedRelays = allRelays.filter((relay) => relay.status === 1)
        for (let relay of connectedRelays) {
            let pub = await relay.publish(event)
            pub.on('ok', () => {
                console.debug(`${relay.url} has accepted our event`)
            })
            pub.on('seen', () => {
                console.debug(`we saw the event on ${relay.url}`)
            })
            pub.on('failed', (reason: any) => {
                console.error(`failed to publish to ${relay.url}: ${reason}`)
            })
        }

        return
    }

    public getEvent(filter): Promise<Event> {
        return new Promise<Event>((resolve) => {
            const subMapName = filter.ids[0] ? filter.ids[0] : filter.kind
            this.subs.set(subMapName, new Map())
            let subMap = this.subs.get(subMapName)
            const gotEvent = (event) => {
                for (let [_, sub] of subMap) {
                    sub.unsub();
                }
                this.subs.delete(subMapName)
                resolve(event)
            }
            for (let [_, relay] of this.relays) {
                if (relay.status !== 1) break

                let sub = relay.sub([filter])
                subMap.set(relay.url, sub)
                sub.on('event', (event: Event) => {
                    console.debug('got event from ' + relay.url)
                    gotEvent(event)
                })
                sub.on('eose', () => {
                    sub.unsub()
                })
            }
        })
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