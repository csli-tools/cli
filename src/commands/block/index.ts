import {Flags} from '@oclif/core'
import {commandReservation, WebsocketAutocomplete} from '../../websockets'

export default class Block extends WebsocketAutocomplete {
  static description = 'Block info, contains transactions'

  static examples = [
    '$ csli block 51666',
  ]

  static flags = {
    full: Flags.boolean({
      char: 'f',
      description: 'Full details',
      required: false,
      default: false,
    }),
  }

  static args = [{name: 'height', description: 'block height (number)'}]

  async run(): Promise<void> {
    let {args, flags} = await this.parse(Block)
    // Add this so TypeScript is happy
    if (typeof this.id === 'undefined') return
    const cmdRes: commandReservation = {
      typeReservation: this.id,
      args
    }
    console.log(`${this.id} args`, args)
    console.log(`${this.id} flags`, flags)
    // Logic in here will take care of waiting for a response
    // from websockets related to what we're interested in
    await this.connectToWebsockets(cmdRes)
  }
}
