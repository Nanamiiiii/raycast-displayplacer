import { execFile, execSync } from 'child_process'
import {
  DisplayProfile,
  isDisplayProfile,
  Position,
  Profile,
  UserPrefs,
} from './utils'
import { promisify } from 'util'
import { cpus } from 'os'

const execp = promisify(execFile)

const executableFile = 'displayplacer'
const brewPrefix = (() => {
  try {
    return execSync('brew --prefix', { encoding: 'utf8' }).trim()
  } catch {
    return cpus()[0].model.includes('Apple') ? '/opt/homebrew' : '/usr/local'
  }
})()

const searchExecutable = (preferences: UserPrefs): string => {
  let foundExecutable = ''

  if (!preferences.executable) {
    const executableCandidates = [
      executableFile,
      '/usr/bin/' + executableFile,
      '/usr/local/bin/' + executableFile,
      brewPrefix + '/bin/' + executableFile,
    ]

    for (const path of executableCandidates) {
      try {
        execSync(path)
        console.log('Found executable: ', path)
        foundExecutable = path
        break
      } catch (e) {
        continue
      }
    }
  } else {
    try {
      execSync(preferences.executable)
      console.log('Found executable: ', preferences.executable)
      foundExecutable = preferences.executable
    } catch (e) {
      console.error(e)
    }
  }

  return foundExecutable
}

const buildArgsFromDisplayProfile = (display: DisplayProfile): string => {
  const collect = [
    'id:' + display.id,
    'res:' + display.res.x.toString() + 'x' + display.res.y.toString(),
    'hz:' + display.hz.toString(),
    'color_depth:' + display.color_depth.toString(),
    'enabled:' + display.enabled.toString(),
    'scaling:' + (display.scaling ? 'on' : 'off'),
    'origin:(' +
      display.origin.x.toString() +
      ',' +
      display.origin.y.toString() +
      ')',
    'degree:' + display.degree.toString(),
  ]
  return collect.join(' ')
}

export const execDisplayplacer = async (
  preferences: UserPrefs,
  args: string[],
) => {
  const executablePath = searchExecutable(preferences)
  if (!executablePath || executablePath === '') {
    throw new Error('Could not find displayplacer executable.')
  }
  await execp(executablePath, args)
}

export const applyDisplayProfile = async (
  preferences: UserPrefs,
  profile: Profile,
) => {
  const args = []
  for (const display of profile.displays) {
    args.push(buildArgsFromDisplayProfile(display))
  }
  await execDisplayplacer(preferences, args)
}

export const getCurrentDisplayProfile = (
  preferences: UserPrefs,
): DisplayProfile[] => {
  const executablePath = searchExecutable(preferences)
  const listOutput = execSync(executablePath + ' list', { encoding: 'utf8' })
  const cmd =
    listOutput
      .split('\n')
      .filter(e => e !== '')
      .at(-1) || ''
  const re = new RegExp(/^displayplacer (".+?"\s*)+$/)
  if (!re.test(cmd)) return []
  const collected: DisplayProfile[] = []
  for (const profstr of cmd.matchAll(/"(.+?)"/g)) {
    const params = profstr[1].split(' ').map(v => v.split(':'))
    const profileObj = Object.fromEntries(params)
    if (typeof profileObj.res === 'string') {
      const pair = (profileObj.res as string).split('x')
      profileObj.res = {
        x: parseInt(pair[0]),
        y: parseInt(pair[1]),
      } as Position
    }
    if (typeof profileObj.hz === 'string') {
      profileObj.hz = parseInt(profileObj.hz as string)
    }
    if (typeof profileObj.color_depth === 'string') {
      profileObj.color_depth = parseInt(profileObj.color_depth as string)
    }
    if (typeof profileObj.enabled === 'string') {
      profileObj.enabled = JSON.parse(profileObj.enabled as string)
    }
    if (typeof profileObj.scaling === 'string') {
      if (profileObj.scaling === 'on') {
        profileObj.scaling = true
      } else if (profileObj.scaling === 'off') {
        profileObj.scaling = false
      } else {
        profileObj.scaling = false
      }
    }
    if (typeof profileObj.degree === 'string') {
      profileObj.degree = parseInt(profileObj.degree as string)
    }
    if (typeof profileObj.origin === 'string') {
      const posMatch = (profileObj.origin as string).match(
        /^\((?<x>[0-9]+),(?<y>[0-9]+)\)$/,
      )
      if (posMatch && posMatch.groups) {
        profileObj.origin = {
          x: parseInt(posMatch.groups.x),
          y: parseInt(posMatch.groups.y),
        } as Position
      }
    }
    if (isDisplayProfile(profileObj)) {
      collected.push(profileObj)
    } else {
      return []
    }
  }
  return collected
}
