import {Flags} from '@oclif/core'
import {WebsocketAutocomplete, commandReservation} from '../../websockets'

export default class Tx extends WebsocketAutocomplete {
  static description = 'Transaction info, contains status, messages, etc.'

  static examples = [
    '$ csli tx hAsH123abc…',
  ]

  static flags = {
    full: Flags.boolean({
      char: 'f',
      description: 'Full details',
      required: false,
      default: false,
    })
  }

  static args = [
    {
      name: 'hash',
      description: 'transaction hash'
    },
    {
      name: 'verbosity',
      description: 'Level of verbosity',
      // Could not seem to get the parse working
      // in case future devs are wondering
      // parse: (input: string) => 'medium',
      default: 'low',
      options: ['low', 'medium', 'high']
    }
  ]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Tx)
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
