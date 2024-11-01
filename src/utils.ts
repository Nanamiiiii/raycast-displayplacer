export interface UserPrefs {
  configfile?: string
  executable?: string
}

export interface Position {
  x: number
  y: number
}

export interface DisplayProfile {
  id: string
  res: Position
  hz: number
  color_depth: number
  enabled: boolean
  scaling: string
  origin: Position
  degree: number
}

export interface Profile {
  name: string
  description?: string
  displays: DisplayProfile[]
}

export interface Config {
  profiles: Profile[]
}
