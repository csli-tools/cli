import {Flags} from '@oclif/core'
import {commandReservation, WebsocketAutocomplete} from '../../websockets'

export default class Msgs extends WebsocketAutocomplete {
  static description = 'Block info, contains transactions'

  static examples = [
    '$ csli msgs txHASHabc123…',
  ]

  static flags = {
    full: Flags.boolean({
      char: 'f',
      description: 'Full details',
      required: false,
      default: false,
    }),
  }

  static args = [{name: 'hash', description: 'transaction hash'}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Msgs)
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
