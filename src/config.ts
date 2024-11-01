import * as fs from 'fs'
import { Config, UserPrefs } from './utils'
import { parseDocument } from 'yaml'

interface ConfigEnvs {
  xdgConfigHome: string
  home: string
}

const searchConfigPath = async (preferences: UserPrefs) => {
  let foundConfig = ''
  if (!preferences.configfile) {
    const configEnvs: ConfigEnvs = {
      xdgConfigHome: process.env.XDG_CONFIG_HOME || '',
      home: process.env.HOME || '',
    }

    const defaultConfigName = 'raycast-displayplacer'
    const defaultDotName = '.raycast-displayplacer'
    const configCandidates = [
      configEnvs.xdgConfigHome + '/' + defaultConfigName + '/config.yml',
      configEnvs.xdgConfigHome + '/' + defaultConfigName + '/config.yaml',
      configEnvs.xdgConfigHome + '/' + defaultConfigName + '.yml',
      configEnvs.xdgConfigHome + '/' + defaultConfigName + '.yaml',
      configEnvs.home + '/.config/' + defaultConfigName + '/config.yml',
      configEnvs.home + '/.config/' + defaultConfigName + '/config.yaml',
      configEnvs.home + '/.config/' + defaultConfigName + '.yml',
      configEnvs.home + '/.config/' + defaultConfigName + '.yaml',
      configEnvs.home + '/' + defaultDotName + '.yml',
      configEnvs.home + '/' + defaultDotName + '.yaml',
    ]

    for (const path of configCandidates) {
      if (!fs.existsSync(path)) continue
      console.log('Found config file: ', path)
      foundConfig = path
      break
    }
  } else {
    if (fs.existsSync(preferences.configfile)) {
      foundConfig = preferences.configfile
      console.log('Found config file: ', preferences.configfile)
    }
  }

  return foundConfig
}

export const getProfilesFromConfig = async (preferences: UserPrefs) => {
  const configPath = await searchConfigPath(preferences)
  if (!configPath || configPath === '') return []
  const configFile = fs.readFileSync(configPath, 'utf8')
  const configJson = parseDocument(configFile).toJSON() as Config
  return configJson.profiles
}
