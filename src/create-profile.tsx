import { Action, ActionPanel, Color, Form, getPreferenceValues, Icon, showToast, Toast } from '@raycast/api'
import { Profile, UserPrefs } from './utils'
import { getCurrentDisplayProfile } from './displayplacer'
import dayjs from 'dayjs'
import { FormValidation, useForm } from '@raycast/utils'
import { DisplayplacerConfig } from './config'

interface formImput {
  name: string,
  desc?: string,
  color?: string
}

export default function Command(): JSX.Element {
  const preferences = getPreferenceValues<UserPrefs>()
  const config = DisplayplacerConfig.Fetch(preferences)
  const displayProfiles = getCurrentDisplayProfile(preferences)
  const defaultName = "Profile " + dayjs().format('YYYY/MM/DD hh:mm:ss')

  const saveProfile = (val: formImput) => {
    const profile = {
      name: val.name,
      description: val.desc,
      color: val.color,
      displays: displayProfiles
    } as Profile
    config.addProfile(profile)
    if (config.writeConfig()) {
      showToast({
        title: "Successfully created profile",
        style: Toast.Style.Success
      })
    } else {
      showToast({
        title: "Failed to create profile",
        message: "Failed to write to the configuration file.",
        style: Toast.Style.Failure
      })
    }
  }

  const { handleSubmit, itemProps } = useForm<formImput>({
    initialValues: {
      name: defaultName
    },
    onSubmit(values) {
      saveProfile(values)
    },
    validation: {
      name: FormValidation.Required,
    }
  })

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create" onSubmit={handleSubmit} icon={{ source: Icon.NewDocument, tintColor: Color.Green }} />
        </ActionPanel>
      }
      navigationTitle='Create Profile for Current Display Arrangement'
    >
      <Form.TextField title='Profile Name' {...itemProps.name} />
      <Form.TextArea title='Description' {...itemProps.desc} />
      <Form.Dropdown title='Color' {...itemProps.color}>
        <Form.Dropdown.Item value="none" title="None" icon={{ source: Icon.CircleFilled, tintColor: Color.PrimaryText }} />
        <Form.Dropdown.Item value="blue" title="Blue" icon={{ source: Icon.CircleFilled, tintColor: Color.Blue }} />
        <Form.Dropdown.Item value="green" title="Green" icon={{ source: Icon.CircleFilled, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="magenta" title="Magenta" icon={{ source: Icon.CircleFilled, tintColor: Color.Magenta }} />
        <Form.Dropdown.Item value="orange" title="Orange" icon={{ source: Icon.CircleFilled, tintColor: Color.Orange }} />
        <Form.Dropdown.Item value="purple" title="Purple" icon={{ source: Icon.CircleFilled, tintColor: Color.Purple }} />
        <Form.Dropdown.Item value="red" title="Red" icon={{ source: Icon.CircleFilled, tintColor: Color.Red }} />
        <Form.Dropdown.Item value="yellow" title="Yellow" icon={{ source: Icon.CircleFilled, tintColor: Color.Yellow }} />
      </Form.Dropdown>
    </Form>
  )
}
