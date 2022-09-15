import {Hook} from '@oclif/core'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as shell from 'shelljs'
import {ShellString} from 'shelljs'
// import * as inquirer from 'inquirer'
//
// const promptAddLocation = async location => {
//   console.log('top of promptAddLocation', location)
//   const prompt = await inquirer.prompt('3po do you read me')
//   console.log('prompt', prompt)
// }

const start: Hook<'init'> = async function (opts) {
  // console.log('aloha init opts', opts)
  if (!shell.which('git')) {
    shell.echo('Sorry, CSLI requires git\nhttps://github.com/git-guides/install-git');
    shell.exit(1);
  }
  if (!shell.which('wasmd')) {
    shell.echo('Sorry, CSLI requires wasmd\nhttps://github.com/CosmWasm/wasmd');
    shell.exit(1);
  }

  let authorizedLocationsConfig = null
  const authorizedLocationsPath = path.join(this.config.configDir, 'authorizedLocations.json')

  try {
    // It's looking for something like: /Users/mike/.config/csli/authorizedLocations.json
    authorizedLocationsConfig = await fs.readJSON(authorizedLocationsPath)
  } catch (e) {
    const readableError = JSON.parse(JSON.stringify(e))
    // console.warn('error getting authorized locations config', readableError)
    if (readableError.errno === -2) {
      // File doesn't exist
      // console.log(`This file does not exist: ${readableError.path}.\nYou don't need it, but it can be handy to customize your battle station.\n\nRun:\ncsli config\nfor more information.`)
      await fs.writeFileSync(authorizedLocationsPath, '{"authorizedLocations": []}')
      authorizedLocationsConfig = await fs.readJSON(authorizedLocationsPath)

      // TODO: perhaps we can actually create the directory
      // like "csli" here: /Users/mike/.config/csli
    }
  }
  // console.log('authorizedLocationsConfig', JSON.parse(authorizedLocationsConfig.toString()))

  // console.log('authorizedLocationsConfig[\'authorizedLocations\']', authorizedLocationsConfig['authorizedLocations'])

  // See if we can find git config
  let currentBranchRes;
  try {
    currentBranchRes = shell.exec('git status -bs', {
      silent: true
    })
  } catch (e) {
    console.log('e', e)
    const usefulError = JSON.parse(JSON.stringify(e))
    console.error('usefulError', usefulError)
    shell.exit(1)
  }
  // const sheesh: ReadonlyArray<string> =
  // sheesh.

  // const cmon = new ShellString(currentBranch.toString())
  const branchInfo = currentBranchRes.toString().matchAll(/^## (.*)\.\.\.(.*)/g)
  // console.log('branchInfo', branchInfo)
  const branches = [...branchInfo]
  // console.log('branches', branches)
  // console.log('branches[0]', branches[0])
  if (branches.length === 0 || branches[0].length < 3) {
    console.error("Don't recognize the git status. Not a good thing.")
  }
  const currentRemote = branches[0][2]
  console.log('currentRemote', currentRemote)

  // Check to see if git repo is in among the authorized locations
  const hasCurrentLocation = authorizedLocationsConfig['authorizedLocations'].includes(currentRemote)
  console.log('hasCurrentLocation', hasCurrentLocation)
  if (!hasCurrentLocation) {
    // await promptAddLocation(currentRemote)
  }
  // authorizedLocationsConfig['authorizedLocations'].push()
  console.log('authorizedLocationsConfig', authorizedLocationsConfig)

  let remotesRes
  try {
    remotesRes = shell.exec('git config --local -l', {
      silent: true
    }).grep('remote.origin.url').stdout.toString().split('remote.origin.url=')
  } catch (e) {
    console.log('e', e)
    const usefulError = JSON.parse(JSON.stringify(e))
    console.error('usefulError', usefulError)
    shell.exit(1)
  }
  // Remove carriage return line feeds
  remotesRes = remotesRes[1].replace('\r', '').replace('\n', '')
  console.log('remotesRes', remotesRes)
  // const hi = branchInfo.entries()
  // for (const branch of here) {
  //   console.log('branch', branch)
  //   console.log('branch length', branch.length)
  // }
  // console.log('cmon', cmon)
  // console.log('here', here)
  return
}

export default start
