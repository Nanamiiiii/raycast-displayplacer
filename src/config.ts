import * as fs from "fs";
import { Config, UserPrefs, Profile } from "./utils";
import { parseDocument, stringify } from "yaml";
import path from "path";

interface ConfigEnvs {
  xdgConfigHome: string;
  home: string;
}

const configEnvs: ConfigEnvs = {
  xdgConfigHome: process.env.XDG_CONFIG_HOME || "",
  home: process.env.HOME || "",
};

const defaultConfigName = "raycast-displayplacer";
const defaultDotName = ".raycast-displayplacer";

const configCandidates = [
  configEnvs.xdgConfigHome + "/" + defaultConfigName + "/config.yml",
  configEnvs.xdgConfigHome + "/" + defaultConfigName + "/config.yaml",
  configEnvs.xdgConfigHome + "/" + defaultConfigName + ".yml",
  configEnvs.xdgConfigHome + "/" + defaultConfigName + ".yaml",
  configEnvs.home + "/.config/" + defaultConfigName + "/config.yml",
  configEnvs.home + "/.config/" + defaultConfigName + "/config.yaml",
  configEnvs.home + "/.config/" + defaultConfigName + ".yml",
  configEnvs.home + "/.config/" + defaultConfigName + ".yaml",
  configEnvs.home + "/" + defaultDotName + ".yml",
  configEnvs.home + "/" + defaultDotName + ".yaml",
];

const getFallbackPath = () => {
  if (configEnvs.xdgConfigHome && configEnvs.xdgConfigHome !== "") {
    return configCandidates[0];
  } else if (configEnvs.home && configEnvs.home !== "") {
    return configCandidates[4];
  }
  return "";
}

const searchConfigPath = (preferences: UserPrefs) => {
  let foundConfig = "";
  if (!preferences.configfile) {
    for (const path of configCandidates) {
      if (!fs.existsSync(path)) continue;
      console.log("Found config file: ", path);
      foundConfig = path;
      break;
    }
  } else {
    if (fs.existsSync(preferences.configfile)) {
      foundConfig = preferences.configfile;
      console.log("Found config file: ", preferences.configfile);
    }
  }
  return foundConfig;
};

export const createNewConfig = async (preferences: UserPrefs) => {
  if (preferences.configfile) {
    if (!fs.existsSync(preferences.configfile)) {
      const dirName = path.dirname(preferences.configfile);
      const ext = path.extname(preferences.configfile);
      if (ext === ".yml" || ext === ".yaml") {
        console.log("Creation failed: invalid file extension " + ext);
        return "";
      }
      fs.mkdirSync(dirName, { recursive: true });
      fs.closeSync(fs.openSync(preferences.configfile, "wx"));
      console.log("Created new config: " + preferences.configfile);
    }
    return preferences.configfile;
  } else {
    if (configEnvs.xdgConfigHome !== "") {
      const configDirXdg = configEnvs.xdgConfigHome + "/" + defaultConfigName;
      fs.mkdirSync(configDirXdg, { recursive: true });
      fs.closeSync(fs.openSync(configDirXdg + "/config.yml", "wx"));
      console.log("Created new config: " + configDirXdg + "config.yml");
      return configDirXdg + "/config.yml";
    } else if (configEnvs.home !== "") {
      const configDir = configEnvs.home;
      const configFile = defaultDotName + ".yml";
      fs.mkdirSync(configDir, { recursive: true });
      fs.closeSync(fs.openSync(configDir + "/" + configFile, "wx"));
      console.log("Created new config: " + configDir + "/" + configFile);
      return configDir + "/" + configFile;
    } else {
      console.log("Cannot create config due to missing $XDG_CONFIG_HOME and $HOME");
      return "";
    }
  }
};

export const createNewConfigWithProfile = async (preferences: UserPrefs, profiles: Profile[]) => {
  const configObj = { profiles: profiles } as Config;
  const configYml = stringify(configObj);
  const configPath = await createNewConfig(preferences);
  fs.writeFileSync(configPath, configYml);
};

export const getProfilesFromConfig = async (preferences: UserPrefs) => {
  const configPath = await searchConfigPath(preferences);
  if (!configPath || configPath === "") {
    return [];
  }
  const configFile = fs.readFileSync(configPath, "utf8");
  const configJson = parseDocument(configFile).toJSON() as Config;
  return configJson.profiles;
};

export class DisplayplacerConfig {
  private config: Config = { profiles: [] };
  private path: string = "";

  static NewConfig = (configpath?: string, profiles?: Profile[]) => {
    const config = new DisplayplacerConfig();
    if (profiles) config.config.profiles = profiles.sort((a, b) => a.name.localeCompare(b.name));
    config.path = (() => {
      if (configpath) {
        const ext = path.extname(configpath);
        if (ext !== ".yml" && ext !== ".yaml") return "";
        return configpath;
      } else {
        if (configEnvs.xdgConfigHome !== "") {
          return configEnvs.xdgConfigHome + "/" + defaultConfigName + "/config.yml";
        } else if (configEnvs.home !== "") {
          return configEnvs.home + "/" + defaultDotName + ".yml";
        } else {
          return "";
        }
      }
    })();
  };

  static Fetch = (preferences: UserPrefs) => {
    const config = new DisplayplacerConfig();
    const configPath = searchConfigPath(preferences);
    config.path = configPath;
    if (configPath && configPath !== "") {
      try {
        const configFile = fs.readFileSync(configPath, "utf8");
        const configJson = parseDocument(configFile).toJSON() as Config;
        config.config = configJson;
        config.config.profiles.sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        throw e;
      }
    }
    return config;
  };

  public isExists = () => {
    if (this.path && this.path !== "") return true;
    else return false;
  }

  public reloadConfig = () => {
    if (this.path && this.path !== "") {
      try {
        const configFile = fs.readFileSync(this.path, "utf8");
        const configJson = parseDocument(configFile).toJSON() as Config;
        this.config = configJson;
        this.config.profiles.sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        throw e;
      }
    }
  };

  public writeConfig = (backup: boolean = false) => {
    if (!this.isExists()) {
        this.path = getFallbackPath();
        console.log("Set fallback config path: " + this.path);
    }
    const configDir = path.dirname(this.path);
    const basename = path.basename(this.path);
    const configYml = stringify(this.config);
    if (fs.existsSync(this.path)) {
      const today = new Date();
      const backupPath =
        configDir +
        "/" +
        basename +
        "_backup_" +
        today.getFullYear() +
        today.getMonth() +
        today.getDate() +
        today.getHours() +
        today.getMinutes() +
        today.getSeconds() +
        ".yml";
      try {
        if (backup) fs.copyFileSync(this.path, backupPath, fs.constants.COPYFILE_EXCL);
        fs.writeFileSync(this.path, configYml);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        return false;
      }
    } else {
      try {
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(this.path, configYml);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        return false;
      }
    }
    return true;
  };

  public deleteProfileAt = (idx: number) => this.config.profiles.splice(idx, 1);

  public addProfile = (profile: Profile) => {
    this.config.profiles.push(profile);
    this.config.profiles.sort((a, b) => a.name.localeCompare(b.name));
    return;
  };

  public profiles = () => this.config.profiles;
}
