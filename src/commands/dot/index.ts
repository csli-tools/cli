import {Flags} from '@oclif/core'
import {WebsocketAutocomplete} from '../../websockets'
import * as ts from "typescript";
import * as fs from 'fs';

export default class Dot extends WebsocketAutocomplete {
  static description = 'Run commands from this project'

  static examples = [
    '$ csli . setup',
  ]

  static flags = {
    full: Flags.boolean({
      char: 'f',
      description: 'Full details',
      required: false,
      default: false,
    }),
  }

  static aliases = ['.']

  static args = [{name: 'height', description: 'block height (number)'}]

  async run(): Promise<void> {
    // load a file from the project
    // const tsc = register({
    //   project: 'honua',
    //   ignoreDiagnostics: [
    //     "1375", // TS1375: 'await' expressions are only allowed at the top level of a file when that file is a module, but this file has no imports or exports. Consider adding an empty 'export {}' to make this file a module.
    //     "1378", // TS1378: Top-level 'await' expressions are only allowed when the 'module' option is set to 'esnext' or 'system', and the 'target' option is set to 'es2017' or higher.
    //   ],
    // });
    // const output = tsc.compile(input, outputPath);

    const source = "let x: string  = 'string';console.log('yo',x)";

    let result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS }});
    eval(result.outputText)

    console.log('aloha0', JSON.stringify(result));

    console.log('aloha', process.cwd())
    console.log('aloha1', this.argv[0])

    // Look for configuration file
    const commandBase = `${process.cwd()}/.csli/commands`
    const gitConfig = `${process.cwd()}/.git/config`
    let fileRes: any
    try {
      fileRes = fs.readFileSync(gitConfig)
    } catch (e) {
      console.error('error reading file', e)
      return
    }
    // Get the repo and see if we have this in our allowed repos

    const reggie = fileRes.toString().match(new RegExp('git@(.*)'))
    // const wtf = reggie.match(fileRes.toString())
    // console.log('reggie', reggie)
    // const hi = fileRes.toString().re.[remote "origin"]

    const commandPath = `${commandBase}/${this.argv[0]}.ts`
    fileRes = null // reset
    try {
      fileRes = fs.readFileSync(commandPath)
    } catch (e) {
      console.error('error reading file', e)
      return
    }
    // console.log('fileRes', fileRes.toString())
    const jsPath = `${commandBase}/${this.argv[0]}.js`
    let transpiledCode = ts.transpile(fileRes.toString())
    await fs.writeFileSync(jsPath, transpiledCode)
    const { runBefore, main, runAfter} = await import(jsPath)
    let beforeRes, mainRes, afterRes
    const config = await this.config.runHook('csli', {id: 'hmmmmmm'})
    // console.log('config from hook', config)
    if (config.successes.length === 0) return
    const hookSuccess = config.successes.pop()
    // console.log('hookSuccess', hookSuccess)
    const hookResult = hookSuccess?.result
    console.log('hookResult', hookResult)

    if (runBefore) {
      beforeRes = await runBefore(this.argv)
      console.log('beforeRes', beforeRes)
    }
    if (main) {
      mainRes = await main(
        this.argv, beforeRes)
      console.log('mainRes', mainRes)
    }
    if (runAfter) {
      afterRes = await runAfter(this.argv, beforeRes, mainRes)
      console.log('afterRes', afterRes)
    }

    // fs.readFile(commandPath, (err, buff) => {
    //   // if any error
    //   if (err) {
    //     console.error('probably could not find it', err);
    //     return;
    //   }
    //
    //   // otherwise log contents
    //   // const bufferStr = buff.toString()
    //   // console.log('buffer', bufferStr);
    //   // ts.transpile(bufferStr, undefined, `${commandBase}/${this.argv[0]}.js`)
    //   // const customCmd = eval(bufferStr)
    //   // console.log('customCmd', customCmd)
    //   // customCmd.hi('there')
    // });
    return
    // let {args, flags} = await this.parse(Dot)
    // // Add this so TypeScript is happy
    // if (typeof this.id === 'undefined') return
    // const cmdRes: commandReservation = {
    //   typeReservation: this.id,
    //   args
    // }
    // console.log(`${this.id} args`, args)
    // console.log(`${this.id} flags`, flags)
    // // Logic in here will take care of waiting for a response
    // // from websockets related to what we're interested in
    // await this.connectToWebsockets(cmdRes)
  }
}
