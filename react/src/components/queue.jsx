import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ReactSortable } from "react-sortablejs";
import { getQueuesByCategory, deleteCategory, addQueue, deleteQueue, reorderQueues, updateQueue, updateCategory } from "../utils/electronDb";
import { X, ChevronsDown, Plus, Minus } from 'lucide-react';
// TODO: Toast notification system will be implemented here
import { 
    Listbox, 
    createListCollection, 
    Box, 
    Flex, 
    Button, 
    IconButton, 
    Input,
    Text,
    Card,
    Group
} from "@chakra-ui/react"
import { motion } from "framer-motion";
import ParticleExplosion from "./queue/ParticleExplosion";
import PopLimitDialog from "./queue/PopLimitDialog";
import QueueHeader from "./queue/QueueHeader";
import QueueItem from "./queue/QueueItem";

export default function Queue({ category }) {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleted, setIsDeleted] = useState(false);
    // TODO: Toast notification manager will be initialized here
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [isPopLimitDialogOpen, setIsPopLimitDialogOpen] = useState(false);
    const [popLimitValue, setPopLimitValue] = useState(category.popLimit || 0);
    const [currentCategory, setCurrentCategory] = useState(category);
    const [popLimitError, setPopLimitError] = useState(false);
    const [prevPopLimit, setPrevPopLimit] = useState(0);
    const [isPopButtonHovered, setIsPopButtonHovered] = useState(false);
    const [isPushButtonHovered, setIsPushButtonHovered] = useState(false);
    const [pushValue, setPushValue] = useState('');
    const [explosions, setExplosions] = useState([]);
    const [lastItemRef, setLastItemRef] = useState(null);
    const [isCursorOnIt, setIsCursorOnIt] = useState(false);
    const [showPushInput, setShowPushInput] = useState(false);
    const inputRef = useRef(null);
    const fetchQueues = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getQueuesByCategory(category.id);
            if (result.success) {
                setQueue(result.data.toReversed() || []);
            } else {
                setError(result.error);
                setQueue([]);
            }
        } catch (error) {
            setError(error.message);
            setQueue([]);
        } finally {
            setLoading(false);
        }
    }, [category.id]);

    useEffect(() => {
        fetchQueues();
    }, [fetchQueues]);

    useEffect(() => {
        setCurrentCategory(category);
    }, [category]);

    const persistReorder = useCallback(async (newList) => {
        const newOrderIds = [...newList].reverse().map(item => item.id);
        try {
            const result = await reorderQueues(category.id, newOrderIds);
            if (!result.success) {
                setError(result.error ?? 'Failed to reorder queue');
                // TODO: Show error notification - Failed to save order
                await fetchQueues();
            }
        } catch (error) {
            setError(error.message);
            // TODO: Show error notification - Failed to save order
            await fetchQueues();
        }
    }, [category.id, fetchQueues]);

    const handleListChange = useCallback((newList, _sortable, evt) => {
        if (!evt) {
            setQueue(newList);
            return;
        }

        const previousOrder = queue.map(item => item.id).join(',');
        const nextOrder = newList.map(item => item.id).join(',');

        setQueue(newList);

        if (previousOrder !== nextOrder) {
            persistReorder(newList);
        }
    }, [persistReorder, queue]);

    const handlePush = async () => {
        if (!pushValue.trim()) return; // 空の入力を防ぐ
        try {
            const result = await addQueue(category.id, { name: pushValue.trim() });
            if (result.success && result.data) {
                setQueue(prev => [result.data, ...prev]);
                setPushValue('');
            }
        }
        catch (error) {
        }
    }

    const handlePop = async () => {
        if (queue.length === 0) return;
        const target = queue[queue.length - 1];
        
        // 最後の要素の位置を取得してパーティクルエフェクトをトリガー
        if (lastItemRef) {
            const rect = lastItemRef.getBoundingClientRect();
            const newExplosion = {
                id: Date.now(),
                position: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                },
                width: rect.width,
                height: rect.height,
            };
            setExplosions(prev => [...prev, newExplosion]);
        }
        const audio = new Audio('/audio/pop.mp3');
        audio.play();
        try {
            const result = await deleteQueue(category.id, target.id);
        } catch (error) {
        }
        setQueue(prev => prev.slice(0, -1));
    }

    const handleDelete = async (queueId) => {
        try {
            const result = await deleteQueue(category.id, queueId);
            if (result.success) {
                setQueue(prev => prev.filter(item => item.id !== queueId));
            }
        } catch (error) {
            // TODO: Show error notification - Failed to delete task
        }
    }

    const handleDeleteCategory = async () => {
        const result = await deleteCategory(category.id);
        if (result.success) {
            setIsDeleted(true);
            // TODO: Show success notification - Category deleted successfully
        } else {
            // TODO: Show error notification - Failed to delete category
        }
    }

    const handleDoubleClick = (item) => {
        setEditingItemId(item.id);
        setEditingValue(item.name);
    }

    const handleBlur = async (item) => {
        if (editingValue.trim() === '') {
            setEditingItemId(null);
            setEditingValue('');
            return;
        }
        
        if (editingValue !== item.name) {
            try {
                const result = await updateQueue(category.id, item.id, { name: editingValue.trim() });
                if (result.success && result.data) {
                    setQueue(prev => prev.map(q => q.id === item.id ? result.data : q));
                } else {
                    // TODO: Show error notification - Failed to update task name
                }
            } catch (error) {
                // TODO: Show error notification - Failed to update task name
            }
        }
        
        setEditingItemId(null);
        setEditingValue('');
    }

    const handleKeyDown = (e, item) => {
        if (e.key === 'Enter') {
            e.target.blur();
        } else if (e.key === 'Escape') {
            setEditingItemId(null);
            setEditingValue('');
        }
    }

    const handleOpenPopLimitDialog = () => {
        setPopLimitValue(currentCategory.popLimit || 0);
        setIsPopLimitDialogOpen(true);
    }

    const handleSavePopLimit = async () => {
        if (popLimitValue <= 0) {
            setPopLimitError(true);
            setPrevPopLimit(popLimitValue);
            return;
        }
        try {
            const result = await updateCategory(currentCategory.id, { popLimit: parseInt(popLimitValue) || 0 });
            if (result.success && result.data) {
                setCurrentCategory(result.data);
                // TODO: Show success notification - Pop Limit updated successfully
            } else {
                // TODO: Show error notification - Failed to update Pop Limit
            }
        } catch (error) {
            // TODO: Show error notification - Failed to update Pop Limit
        }
        setIsPopLimitDialogOpen(false);
    }

    useEffect(() => {
        // 前回の値を保持して、それと比較して変更があったらエラーフラグをfalse
        if (prevPopLimit !== popLimitValue) {
            setPopLimitError(false);
            setPrevPopLimit(popLimitValue);
            console.log(prevPopLimit, popLimitValue);
        }
    }, [popLimitValue]);

    // useEffect(() => {
    //     console.log('isCursorOnIt:', isCursorOnIt);
    // }, [isCursorOnIt]);

    useEffect(() => {
        if (showPushInput && inputRef.current) {
            // 少し遅延を入れて確実にフォーカスを設定
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [showPushInput]);
    
    // queueからListboxのcollectionを作成
    const queueCollection = useMemo(() => {
        return createListCollection({
            items: queue.map(item => ({
                label: item.name,
                value: item.id.toString(),
                ...item
            }))
        });
    }, [queue]);
    
    return (
        isDeleted ? (
            <div>
            </div>
        ) : (
        <Card.Root
            onMouseEnter={() => setIsCursorOnIt(true)}
            onMouseLeave={() => setIsCursorOnIt(false)}
        >
        <Card.Body>
        <Flex 
            flexDirection="column" 
            alignItems="flex-start" 
            justifyContent="flex-start"
        >
            <QueueHeader
                category={category}
                isCursorOnIt={isCursorOnIt}
                onDeleteCategory={handleDeleteCategory}
                onOpenPopLimitDialog={handleOpenPopLimitDialog}
            />
            {error && (
                <Box fontSize="sm" color="red.500" my={2}>
                    {error}
                </Box>
            )}
            {/* 5つ以上の要素があった時のsort動作が不安定 */}
            {queue.length > 5 && (
                <Box>
                    {/* <Box as="h1">Queue is full</Box> */}
                </Box>
            )}
            {/* <Box 
                    onMouseEnter={() => setIsPushButtonHovered(true)}
                    onMouseLeave={() => setIsPushButtonHovered(false)}
                    style={{ 
                        width: '100%', 
                        borderBottomLeftRadius: '0', 
                        borderBottomRightRadius: '0',
                        height: isPushButtonHovered ? '40px' : '15px',
                        transition: 'height 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'var(--chakra-colors-border)',
                        backgroundColor: 'var(--chakra-colors-bg-surface)',
                    }}
                >
                    {isPushButtonHovered ? <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                        <ChevronsDown style={{ width: '16px', height: '16px' }} />
                        <Input value={pushValue} size="xs" onChange={(e) => setPushValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handlePush() }} />
                    </Box> : <ChevronsDown style={{ width: '16px', height: '16px' }} />}
                </Box> */}
            <Box position="relative" width="100%">
                {!showPushInput && (
                    <Box
                        position="absolute"
                        top="-16px"
                        left="50%"
                        transform="translateX(-50%)"
                        zIndex={10}
                        opacity={isCursorOnIt ? 1 : 0}
                        pointerEvents={isCursorOnIt ? 'auto' : 'none'}
                        transition="opacity 0.2s ease-in-out"
                    >
                        <IconButton
                            size="xs"
                            variant="surface"
                            rounded="full"
                            onClick={() => setShowPushInput(true)}
                        >
                            <Plus style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                    </Box>
                )}
                {showPushInput && (
                    <Group attached w="full" mb={2}>
                        <Input
                            ref={inputRef}
                            flex="1"
                            variant="outline"
                            value={pushValue}
                            onChange={(e) => setPushValue(e.target.value)}
                            onBlur={() => {
                                // 少し遅延を入れて、追加ボタンのクリックイベントが処理されるのを待つ
                                setTimeout(() => {
                                    setShowPushInput(false);
                                    setPushValue('');
                                }, 100);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handlePush();
                                    setShowPushInput(false);
                                } else if (e.key === 'Escape') {
                                    setShowPushInput(false);
                                    setPushValue('');
                                }
                            }}
                            placeholder="新しいタスクを追加..."
                        />
                        <IconButton 
                            onMouseDown={(e) => {
                                e.preventDefault(); // onBlurより先に処理されるようにする
                                handlePush();
                                setShowPushInput(false);
                            }}
                            size="md" 
                            aria-label="追加" 
                            variant="outline"
                        >
                            <Plus style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                    </Group>
                )}
                <Listbox.Root collection={queueCollection} width="100%" border="none" borderWidth={0}>
                <Listbox.Content asChild border="none" borderWidth={0}>
                    <ReactSortable animation={200} list={queue} setList={handleListChange} style={{ width: '100%', display: 'flex', flexDirection: 'column', border: 'none' }} tag="div">
                        {/* {queue.length > 5 ? (
                            queue.slice(queue.length - 5, queue.length).map((item) => (
                                <Box 
                                    key={item.id}
                                    data-scope="listbox"
                                    data-part="item"
                                    position="relative"
                                    display="flex"
                                    cursor="pointer"
                                    userSelect="none"
                                    alignItems="center"
                                    borderRadius="xs"
                                    px={2}
                                    py={1.5}
                                    _hover={{ bg: 'gray.100' }}
                                >
                                    <Box flex={1}>{item.name}</Box>
                                </Box>
                            ))
                        ) : ( */}
                            {queue.map((item, index) => (
                                <QueueItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    queueLength={queue.length}
                                    popLimit={currentCategory.popLimit}
                                    isLastItem={index === queue.length - 1}
                                    editingItemId={editingItemId}
                                    editingValue={editingValue}
                                    onDoubleClick={handleDoubleClick}
                                    onEditValueChange={setEditingValue}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    onDelete={handleDelete}
                                    onSetLastItemRef={setLastItemRef}
                                />
                            ))}
                        {/* )} */}
                    </ReactSortable>
                </Listbox.Content>
            </Listbox.Root>
                <Box
                    position="absolute"
                    bottom="-16px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex={10}
                    opacity={isCursorOnIt ? 1 : 0}
                    pointerEvents={isCursorOnIt ? 'auto' : 'none'}
                    transition="opacity 0.2s ease-in-out"
                >
                    <IconButton
                        size="xs"
                        variant="surface"
                        rounded="full"
                        colorPalette="red"
                        onClick={handlePop}
                    >
                        <Minus style={{ width: '16px', height: '16px' }} />
                    </IconButton>
                </Box>
            </Box>
            {/* {queue.length > 0 && (
                <Button 
                    onClick={() => handlePop()} 
                    colorPalette="red" 
                    onMouseEnter={() => setIsPopButtonHovered(true)}
                    onMouseLeave={() => setIsPopButtonHovered(false)}
                    style={{ 
                        width: '100%', 
                        borderTopLeftRadius: '0', 
                        borderTopRightRadius: '0',
                        height: isPopButtonHovered ? '30px' : '15px',
                        transition: 'height 0.2s ease-in-out'
                    }}
                >
                    {isPopButtonHovered ? <Box display="flex" alignItems="center" justifyContent="center" gap={2}><ChevronsDown style={{ width: '16px', height: '16px' }} /> <span>pop</span></Box> : <ChevronsDown style={{ width: '16px', height: '16px' }} />}
                </Button>
            )} */}
            <div className="flex flex-col">
                {/* <QueuePushInput onPush={handlePush} /> */}
                <div className="flex justify-end items-end">
                    </div>
                </div>
            <PopLimitDialog
                isOpen={isPopLimitDialogOpen}
                onClose={() => setIsPopLimitDialogOpen(false)}
                popLimitValue={popLimitValue}
                onPopLimitChange={setPopLimitValue}
                onSave={handleSavePopLimit}
                hasError={popLimitError}
            />
            {/* パーティクル爆発エフェクト */}
            {explosions.map((explosion) => (
                <ParticleExplosion
                    key={explosion.id}
                    position={explosion.position}
                    width={explosion.width || 0}
                    height={explosion.height || 0}
                    onComplete={() => {
                        setExplosions(prev => prev.filter(e => e.id !== explosion.id));
                    }}
                />
            ))}
            </Flex>
        </Card.Body>
        </Card.Root>
        )
    )
}

// ==========================================
// Toast Notification System
// ==========================================
// TODO: Implement new toast notification system
// - ToastList component
// - Toast provider and manager
// - Success, error, warning, info variants
// - Auto-dismiss functionality
// - Multiple toast positioning
// ==========================================