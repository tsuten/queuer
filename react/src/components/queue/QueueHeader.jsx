import { Flex, Box, Menu, IconButton } from "@chakra-ui/react";
import { Ellipsis, Trash2 } from 'lucide-react';
import { motion } from "framer-motion";
import QueueCategoryName from "../queueCategoryName";

/**
 * キューカテゴリのヘッダーコンポーネント
 * カテゴリ名と操作メニュー（削除、Pop Limit変更）を表示
 */
export default function QueueHeader({ 
    category, 
    isCursorOnIt,
    onDeleteCategory,
    onOpenPopLimitDialog 
}) {
    return (
        <Flex flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
            <QueueCategoryName category={category} />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isCursorOnIt ? 1 : 0 }}
                transition={{ duration: 0.2, ease: "linear" }}
                style={{
                    pointerEvents: isCursorOnIt ? 'auto' : 'none',
                    visibility: isCursorOnIt ? 'visible' : 'hidden'
                }}
            >
                <Menu.Root positioning={{ placement: "center-start" }}>
                    <Menu.Trigger asChild>
                        <IconButton variant="outline" rounded="full" size="xs">
                            <Ellipsis style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                    </Menu.Trigger>
                    <Menu.Positioner>
                        <Menu.Content>
                            <Menu.Item
                                value="delete"
                                color="fg.error"
                                _hover={{ bg: "bg.error", color: "fg.error" }}
                                rounded="xs"
                                cursor="pointer"
                                onClick={onDeleteCategory}
                            >
                                <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444'}} />
                                <Box>Delete Category</Box>
                            </Menu.Item>
                            <Menu.Item 
                                value="pop-limit" 
                                onClick={onOpenPopLimitDialog} 
                                cursor="pointer" 
                                rounded="xs"
                            >
                                Change pop limit
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Menu.Root>
            </motion.div>
        </Flex>
    );
}

