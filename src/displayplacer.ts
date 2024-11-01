import { execFile, execSync } from 'child_process'
import { DisplayProfile, Profile, UserPrefs } from './utils'
import { promisify } from 'util'
import { cpus } from 'os'
import { showToast, Toast } from '@raycast/api'

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
        console.log(e)
        continue
      }
    }
  } else {
    try {
      execSync(preferences.executable)
      console.log('Found executable: ', preferences.executable)
      foundExecutable = preferences.executable
    } catch (e) {
      console.log(e)
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
    'scaling:' + display.scaling,
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
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: 'Executing displayplacer',
  })
  const executablePath = searchExecutable(preferences)
  if (!executablePath || executablePath === '') {
    toast.style = Toast.Style.Failure
    toast.title = 'Failed to execute'
    toast.message = 'Cannot find displayplacer executable'
    return
  }
  try {
    await execp(executablePath, args)
    toast.style = Toast.Style.Success
    toast.title = 'Success'
  } catch (e) {
    toast.style = Toast.Style.Failure
    toast.title = 'Failed to execute'
    if (e instanceof Error) {
      toast.message = e.message
    }
  }
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
