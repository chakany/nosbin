// Nostr Init
import "websocket-polyfill"
import {
    relayInit,
    generatePrivateKey,
    getPublicKey,
    getEventHash,
    signEvent,
} from 'nostr-tools'
import { browser } from "$app/environment";
import type { Relay, Event } from "nostr-tools"

export default class Nostr {
    public relay: Relay | null
    public pubkey: string
    public privkey: string;
    public extension: boolean;
    constructor() {
        this.relay = null;
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

    public async connect() {
        this.relay = relayInit('wss://nostr.chaker.net')
        await this.relay.connect()

        this.relay.on('connect', () => {
            console.log(`connected to ${this.relay!.url}`)
        })
        this.relay.on('error', () => {
            console.log(`failed to connect to ${this.relay!.url}`)
        })
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
            let sub = this.relay!.sub([
                {
                    ids: [id]
                }
            ])
            sub.on('event', (event: Event) => {
                console.log('we got the event we wanted:', event)
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

        let pub = this.relay!.publish(event)
        pub.on('ok', () => {
            console.debug(`${this.relay?.url} has accepted our event`)
        })
        pub.on('seen', () => {
            console.debug(`we saw the event on ${this.relay?.url}`)
        })
        pub.on('failed', (reason: any) => {
            console.error(`failed to publish to ${this.relay?.url}: ${reason}`)
        })
        return event.id
    }
}