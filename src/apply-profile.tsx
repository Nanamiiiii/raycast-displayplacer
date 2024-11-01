import {
  ActionPanel,
  Action,
  Icon,
  List,
  getPreferenceValues,
} from '@raycast/api'
import { UserPrefs } from './utils'
import { usePromise } from '@raycast/utils'
import { getProfilesFromConfig } from './config'
import { Fragment } from 'react/jsx-runtime'
import { applyDisplayProfile } from './displayplacer'

export default function Command(): JSX.Element {
  const preferences = getPreferenceValues<UserPrefs>()

  const { data: profiles } = usePromise(() =>
    getProfilesFromConfig(preferences),
  )

  return (
    <List isShowingDetail>
      {profiles?.map((profile, idx) => (
        <List.Item
          key={idx}
          icon={Icon.Monitor}
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
                            text={display.scaling}
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
                onAction={() => applyDisplayProfile(preferences, profile)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
