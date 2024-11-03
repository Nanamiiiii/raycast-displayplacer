export interface UserPrefs {
  configfile?: string;
  executable?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface DisplayProfile {
  id: string;
  res: Position;
  hz: number;
  color_depth: number;
  enabled: boolean;
  scaling: boolean;
  origin: Position;
  degree: number;
}

export interface Profile {
  name: string;
  description?: string;
  color?: string;
  displays: DisplayProfile[];
}

export interface Config {
  profiles: Profile[];
}

export const isPosition = (val: unknown): val is Position => {
  if (typeof val !== "object" || val === null) return false;
  const { x, y } = val as Record<keyof Position, unknown>;
  if (typeof x !== "number") return false;
  if (typeof y !== "number") return false;
  return true;
};

export const isDisplayProfile = (val: unknown): val is DisplayProfile => {
  if (typeof val !== "object" || val === null) return false;
  const { id, res, hz, color_depth, enabled, scaling, origin, degree } = val as Record<keyof DisplayProfile, unknown>;
  if (typeof id !== "string") return false;
  if (!isPosition(res)) return false;
  if (typeof hz !== "number") return false;
  if (typeof color_depth !== "number") return false;
  if (typeof enabled !== "boolean") return false;
  if (typeof scaling !== "boolean") return false;
  if (!isPosition(origin)) return false;
  if (typeof degree !== "number") return false;
  return true;
};
