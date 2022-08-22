import {AutocompleteBase} from '@oclif/plugin-autocomplete/lib/base'
import { WebSocket } from 'ws';

export class WSDetails {
    identifier: string | null
    data: any | null
}

class Skinny {
  address: WSDetails
  block: WSDetails
  contract: WSDetails
  msg: WSDetails
  tx: WSDetails

  public constructor() {
    this.address = {
      data: null,
      identifier: null
    }
    this.block = {
      data: null,
      identifier: null
    }
    this.contract = {
      data: null,
      identifier: null
    }
    this.msg = {
      data: null,
      identifier: null
    }
    this.tx = {
      data: null,
      identifier: null
    }
  }
}

// It's not good copy/pasting this from @csli/dashboard
interface wsCSLIPayload {
  type: "block" | "tx" | "msg" | "address" | "contract",
  identifier: string, // Use 'nada' if there are none of this type
  data: any
}

export interface commandReservation {
  typeReservation: string,
  args: any
}

export abstract class WebsocketAutocomplete extends AutocompleteBase {
  public ws: WebSocket;
  public theSkinny: Skinny;
  public hasReceivedMessages: boolean;
  public broadcastQueue: Map<string, any>;

  public async checkHazTheSkinny(message: wsCSLIPayload, cmdRes: commandReservation) {
    switch (message.type) {
      case 'block':
          this.theSkinny.block.data = message.data
          this.theSkinny.block.identifier = message.identifier
          break;
        case 'tx':
          this.theSkinny.tx.data = message.data
          this.theSkinny.tx.identifier = message.identifier
          break;
        case 'msg':
          this.theSkinny.msg.data = message.data
          this.theSkinny.msg.identifier = message.identifier
          break;
        case 'address':
          this.theSkinny.address.data = message.data
          this.theSkinny.address.identifier = message.identifier
          break;
        case 'contract':
          this.theSkinny.contract.data = message.data
          this.theSkinny.contract.identifier = message.identifier
          break;
    }
    this.hasReceivedMessages = true
    if (this.broadcastQueue.has(message.type)
      && message.identifier !== 'nada') {
      // Here's where we call a function to show all the useful stuff
      // and if they have medium or high verbosity, show moar
      const args = this.broadcastQueue.get(message.type)
      // If the user specified a hash in the first argument, use that
      let hash: string = message.identifier.toLowerCase()
      if (Object.keys(args).length !== 0) {
        // The first argument is the identifier.
        // guilty of assumption here.
        const firstArg = Object.keys(args)[0]
        if (typeof args[firstArg] !== 'undefined') {
          // User designated block height, tx hash, etc.
          // Don't use message's identifier
          hash = args[firstArg]
        }
      }

      console.log('Here is where we look up details on hash', hash)
      // Remove it from the broadcast queue after we've output it
      this.broadcastQueue.delete(message.type)
      if (this.broadcastQueue.size === 0) {
        // Finally close the websocket when we've got the final message
        this.ws.close()
      }
    }
  }

  public async connectToWebsockets(cmdRes: commandReservation) {
    this.theSkinny = new Skinny();
    this.broadcastQueue = new Map<string, any>()
    this.broadcastQueue.set(cmdRes.typeReservation, cmdRes.args)
    this.ws = new WebSocket('ws://localhost:63736')
    const soStupid = this
    this.ws.on('message', async function message(data: any) {
      const jsonData: wsCSLIPayload = JSON.parse(Buffer.from(data).toString())
      console.log('Incoming websocket jsonData', jsonData)
      soStupid.checkHazTheSkinny(jsonData, cmdRes)
    });
  }

  public async killWebsockets() {
    this.ws.close()
  }

}
