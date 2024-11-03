import {
  ActionPanel,
  Action,
  Icon,
  List,
  getPreferenceValues,
  Color,
  confirmAlert,
  Alert,
  showToast,
  Toast,
} from '@raycast/api'
import { Profile, UserPrefs } from './utils'
import { DisplayplacerConfig } from './config'
import { Fragment } from 'react/jsx-runtime'
import { applyDisplayProfile } from './displayplacer'
import { useState } from 'react'

export default function Command(): JSX.Element {
  const preferences = getPreferenceValues<UserPrefs>()
  const config = DisplayplacerConfig.Fetch(preferences)

  const [profiles, setProfiles] = useState<Profile[]>(config.profiles())

  const applyProfile = async (preferences: UserPrefs, profile: Profile) => {
    const toast = await showToast({
      title: 'Applying profile',
      style: Toast.Style.Animated,
    })
    try {
      await applyDisplayProfile(preferences, profile)
      toast.style = Toast.Style.Success
      toast.title = 'Success'
    } catch (e) {
      if (e instanceof Error) {
        toast.style = Toast.Style.Failure
        toast.title = 'Failed to apply profile'
        toast.message = e.message
      }
    }
  }

  const deleteProfileWithConfirm = async (
    config: DisplayplacerConfig,
    idx: number,
  ) => {
    const options: Alert.Options = {
      title: 'Delete the profile "' + config.profiles()[idx].name + '"?',
      message: 'You cannot restore once deleting.',
      primaryAction: {
        title: 'Delete',
        style: Alert.ActionStyle.Destructive,
        onAction: async () => {
          config.deleteProfileAt(idx)
          if (!config.writeConfig()) {
            await showToast({
              title: 'Failed to update profile',
              message: 'Something went wrong.',
              style: Toast.Style.Failure,
            })
          }
        },
      },
    }
    await confirmAlert(options)
    config.reloadConfig()
    setProfiles(config.profiles())
  }

  return (
    <List isShowingDetail>
      {profiles.map((profile, idx) => (
        <List.Item
          key={idx}
          icon={{
            source: Icon.Monitor,
            tintColor: profile.color || Color.PrimaryText,
          }}
          title={profile.name}
          subtitle={profile.description || 'No information'}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Profile Name"
                    text={profile.name}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Description"
                    text={profile.description || 'No information'}
                  />
                  {profile.displays.map(display => {
                    if (display.enabled) {
                      return (
                        <Fragment key={display.id}>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Display ID"
                            text={display.id}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Resolution"
                            text={
                              display.res.x.toString() +
                              'x' +
                              display.res.y.toString()
                            }
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Refresh Rate"
                            text={display.hz.toString()}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Color Depth"
                            text={display.color_depth.toString()}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Scaling"
                            text={display.scaling.toString()}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Position"
                            text={
                              display.origin.x.toString() +
                              'x' +
                              display.origin.y.toString()
                            }
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Degree"
                            text={display.degree.toString()}
                          />
                        </Fragment>
                      )
                    } else {
                      return <></>
                    }
                  })}
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action
                title="Apply"
                autoFocus={true}
                icon={{ source: Icon.Checkmark, tintColor: Color.Green }}
                onAction={() => applyProfile(preferences, profile)}
              />
              <Action
                title="Modify"
                icon={{ source: Icon.Pencil, tintColor: Color.Blue }}
              />
              <Action
                title="Delete"
                icon={{ source: Icon.Trash, tintColor: Color.Red }}
                onAction={() => deleteProfileWithConfirm(config, idx)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
