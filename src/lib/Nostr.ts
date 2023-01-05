// Nostr Init
import "websocket-polyfill"
import {
    relayInit,
    generatePrivateKey,
    getPublicKey,
    getEventHash,
    signEvent,
} from 'nostr-tools'
import type { Relay, Event } from "nostr-tools"

export default class Nostr {
    public relay: Relay | null
    public pubkey: string
    public privkey: string;
    constructor() {
        this.relay = null;
        this.pubkey = ""
        this.privkey = ""
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
        return [this.pubkey, this.privkey]
    }

    public setKeys(pub: string, priv: string) {
        this.pubkey = pub;
        this.privkey = priv
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
        event.sig = signEvent(event, this.privkey)

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