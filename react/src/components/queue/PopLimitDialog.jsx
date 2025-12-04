import { Dialog, Button, Input, Text, Flex } from "@chakra-ui/react";

/**
 * Pop Limit設定ダイアログコンポーネント
 * キューから削除されないように保護する要素数を設定する
 */
export default function PopLimitDialog({ 
    isOpen, 
    onClose, 
    popLimitValue, 
    onPopLimitChange, 
    onSave,
    hasError 
}) {
    return (
        <Dialog.Root 
            open={isOpen} 
            onOpenChange={(e) => !e.open && onClose()}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="425px">
                    <Dialog.Header>
                        <Dialog.Title>Change Pop Limit</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.CloseTrigger />
                    <Dialog.Body display="flex" flexDirection="column" gap={4} py={4}>
                        <Text fontSize="sm" color="gray.600">
                            Set the number of items to protect from being popped from the queue.
                        </Text>
                        {hasError && (
                            <Text fontSize="sm" color="red.500">
                                Pop Limit must be 0 or greater.
                            </Text>
                        )}
                        <Flex alignItems="center" gap={4}>
                            <Text 
                                as="label" 
                                htmlFor="popLimit" 
                                textAlign="right"
                                minW="100px"
                            >
                                Pop Limit
                            </Text>
                            <Input
                                id="popLimit"
                                type="number"
                                min="0"
                                value={popLimitValue}
                                onChange={(e) => onPopLimitChange(e.target.value)}
                                flex={1}
                            />
                        </Flex>
                    </Dialog.Body>
                    <Dialog.Footer display="flex" gap={3}>
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button onClick={onSave}>
                            Save
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

