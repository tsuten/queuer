"use client";

import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { Switch } from "@chakra-ui/react"
import { Box } from "@chakra-ui/react"
import { RadioGroup } from "@chakra-ui/react"
import { Text } from "@chakra-ui/react"

const SettingsModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Settings
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
            <Box display="flex" flexDirection="column" gap={2}>
                <Switch.Root>
                <Switch.HiddenInput />
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Play Sound</Switch.Label>
                </Switch.Root>
                <Switch.Root>
                <Switch.HiddenInput />
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Show Pop Button</Switch.Label>
                </Switch.Root>
                <Switch.Root>
                <Switch.HiddenInput />
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Play Animation</Switch.Label>
                </Switch.Root>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Text fontWeight="medium">Animation Direction</Text>
                    <RadioGroup.Root display="flex" flexDirection="row" gap={4}>
                        <RadioGroup.Item>
                            <RadioGroup.ItemHiddenInput />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>Top to Bottom</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item>
                            <RadioGroup.ItemHiddenInput />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>Bottom to Top</RadioGroup.ItemText>
                        </RadioGroup.Item>
                    </RadioGroup.Root>
                </Box>
            </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default SettingsModal;