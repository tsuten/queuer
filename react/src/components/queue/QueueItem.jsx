import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { Trash2, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

/**
 * 個々のキューアイテムコンポーネント
 * - ダブルクリックで編集可能
 * - ホバー時にアクションボタン表示
 * - Pop Limit判定による背景色変更
 */
export default function QueueItem({ 
    item,
    index,
    queueLength,
    popLimit,
    isLastItem,
    editingItemId,
    editingValue,
    onDoubleClick,
    onEditValueChange,
    onBlur,
    onKeyDown,
    onDelete,
    onSetLastItemRef
}) {
    const [isHovering, setIsHovering] = useState(false);
    
    // Pop Limitの範囲内かどうかを判定
    const isWithinPopLimit = index >= queueLength - popLimit || !popLimit;
    
    // 編集中かどうか
    const isEditing = editingItemId === item.id;
    
    return (
        <Box
            position="relative"
            overflow="hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <Box
                ref={isLastItem ? onSetLastItemRef : null}
                data-scope="listbox"
                data-part="item"
                onDoubleClick={() => onDoubleClick(item)}
                position="relative"
                display="flex"
                cursor="pointer"
                userSelect="none"
                alignItems="center"
                borderRadius="xs"
                px={2}
                py={1.5}
                pr={isHovering ? "64px" : 2}
                bg={isWithinPopLimit ? "gray.50" : "gray.200"}
                _hover={{ bg: isWithinPopLimit ? 'gray.100' : 'gray.300' }}
                transition="all 0.2s"
            >
                {isEditing ? (
                    <Box
                        as="input"
                        type="text"
                        value={editingValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onBlur={() => onBlur(item)}
                        onKeyDown={(e) => onKeyDown(e, item)}
                        autoFocus
                        flex={1}
                        outline="none"
                        bg="transparent"
                    />
                ) : (
                    <Box flex={1}>{item.name}</Box>
                )}
            </Box>
            <AnimatePresence>
                {isHovering && (
                    <motion.div
                        initial={{ x: 100 }}
                        animate={{ x: 0 }}
                        exit={{ x: 100 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            height: '100%',
                            zIndex: 10,
                            display: 'flex'
                        }}
                    >
                        <Button 
                            variant="solid"
                            size="xs"
                            h="full"
                            w="32px"
                            minW="32px"
                            borderRadius="none"
                            colorPalette="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement first button action
                            }}
                        >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                        </Button>
                        <Button 
                            variant="solid"
                            size="xs"
                            h="full"
                            w="32px"
                            minW="32px"
                            borderRadius="none"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                            }}
                        >
                            <ChevronsRight style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}

