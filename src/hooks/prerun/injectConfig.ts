import {Hook} from '@oclif/core'
import * as fs from 'fs-extra'
import * as path from 'path'

const injectConfig: Hook<'prerun'> = async function (opts) {
  let cliConfig: any = null
  try {
    // It's looking for something like: /Users/mike/.config/csli/cli.json
    cliConfig = await fs.readJSON(path.join(this.config.configDir, 'cli.json'))
  } catch (e) {
    const readableError = JSON.parse(JSON.stringify(e))
    console.warn('error getting cli config', readableError)
    if (readableError.errno === -2) {
      // File doesn't exist
      console.log(`This file does not exist: ${readableError.path}.\nYou don't need it, but it can be handy to customize your battle station.\n\nRun:\ncsli config\nfor more information.`)

      // TODO: perhaps we can actually create the directory
      // like "csli" here: /Users/mike/.config/csli
    }
  }

  // If there's no config file, use the argument defaults in commands
  if (!cliConfig) return

  // Otherwise, see if we have config that overrides the default
  if (cliConfig[opts.Command.id]) {
    if (cliConfig[opts.Command.id]['verbosity']) {
      opts.Command.args?.map(arg => {
        if (arg.name === 'verbosity') {
          arg.default = cliConfig[opts.Command.id]['verbosity']
        }
      })
    }
  }
  // opts.Command.run()
  return cliConfig
}

export default injectConfig
