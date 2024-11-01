# Displayplacer on Raycast

Raycast extension to use displayplacer more conveniently.

## Features & Roadmap
- [x] Apply pre-defined profile from raycast
- [ ] Add new profile from current display arrangement
- [ ] Profile Modification
- [ ] Arrage display easily from raycast UI

## Usage
### Install displayplacer
Refer to https://github.com/jakehilborn/displayplacer

### Create `yaml` configuration
- Create configuration file at following locations
    - `$XDG_CONFIG_HOME/raycast-displayplacer/config.yml`
    - `$XDG_CONFIG_HOME/raycast-displayplacer.yml`
    - `$HOME/.raycast-displayplacer.yml`
    - You can use `.yaml` as extension
    - If you want to use another location, you are free to specify the file location
- In the future, I plan to make it possible to output yaml from raycast

#### Example
```yaml
profiles:
  - name: "Profile 1"
    description: "Test profile"
    displays:
      - id: "1DCDBDC1-B3FD-40B3-A048-EEF1CDE789ED"
        res:
          x: 2560
          y: 1440
        hz: 60
        color_depth: 8
        enabled: true
        scaling: "on"
        origin:
          x: 0
          y: 0
        degree: 0
      - id: "37D8832A-2D66-02CA-B9F7-8F30A301B230"
        res:
          x: 1800
          y: 1169
        hz: 120
        color_depth: 8
        enabled: true
        scaling: "on"
        origin:
          x: 380
          y: 1440
        degree: 0
  - name: "Profile 2"
    displays:
      - id: "1DCDBDC1-B3FD-40B3-A048-EEF1CDE789ED"
        res:
          x: 2560
          y: 1440
        hz: 60
        color_depth: 8
        enabled: true
        scaling: "on"
        origin:
          x: 0
          y: 0
        degree: 0
      - id: "37D8832A-2D66-02CA-B9F7-8F30A301B230"
        res:
          x: 1800
          y: 1169
        hz: 120
        color_depth: 8
        enabled: true
        scaling: "on"
        origin:
          x: 2560
          y: 135
        degree: 0
```

