"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ReactSortable } from "react-sortablejs";
import { getQueuesByCategory, deleteCategory, addQueue, deleteQueue, reorderQueues, updateQueue, updateCategory } from "../actions/queueActions";
import { Ellipsis, Trash2, X, ChevronsDown, ChevronsRight, Plus, Minus } from 'lucide-react';
import { Toast } from '@base-ui-components/react/toast';
import styles from './queue.module.css';
import { 
    Listbox, 
    createListCollection, 
    Box, 
    Flex, 
    Menu, 
    Button, 
    IconButton, 
    Input,
    Dialog,
    Text,
    Card,
    Group
} from "@chakra-ui/react"
import QueueCategoryName from "./queueCategoryName";
import { motion, AnimatePresence } from "framer-motion";


// パーティクル爆発エフェクトコンポーネント
function ParticleExplosion({ position, width, height, onComplete }) {
    const particleCount = 100;
    const particles = Array.from({ length: particleCount }, (_, i) => {
        // パーティクルの初期位置を要素全体にわたってランダムに配置
        const startX = (Math.random() - 0.5) * width;
        const startY = (Math.random() - 0.5) * height;
        
        // 各パーティクルがランダムな方向に飛び散る
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 70;
        const grayValue = Math.floor(180 + Math.random() * 75); // 180-255の範囲で白と灰色の間
        return {
            id: i,
            startX: startX,
            startY: startY,
            x: startX + Math.cos(angle) * velocity,
            y: startY + Math.sin(angle) * velocity,
            size: 2 + Math.random() * 3,
            rotation: Math.random() * 360,
            color: `rgb(${grayValue}, ${grayValue}, ${grayValue})`,
        };
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    initial={{
                        x: particle.startX,
                        y: particle.startY,
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                    }}
                    animate={{
                        x: particle.x,
                        y: particle.y,
                        opacity: 0,
                        scale: 0,
                        rotate: particle.rotation,
                    }}
                    transition={{
                        duration: 1.0,
                        ease: 'easeOut',
                    }}
                    style={{
                        position: 'absolute',
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        borderRadius: '50%',
                    }}
                />
            ))}
        </div>
    );
}

export default function QueueWithToast({ category }) {
    return (
        <Toast.Provider>
            <Queue category={category} />
            <Toast.Portal>
                <Toast.Viewport className={styles.Viewport}>
                    <ToastList />
                </Toast.Viewport>
            </Toast.Portal>
        </Toast.Provider>
    );
}

function Queue({ category }) {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleted, setIsDeleted] = useState(false);
    const toastManager = Toast.useToastManager();
    const [hoveringTargetId, setHoveringTargetId] = useState(null);
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
                toastManager.add({
                    title: "順序の保存に失敗しました",
                    description: "サーバーへの反映に失敗しました。再読み込みします。",
                });
                await fetchQueues();
            }
        } catch (error) {
            setError(error.message);
            toastManager.add({
                title: "順序の保存に失敗しました",
                description: "サーバーへの反映に失敗しました。再読み込みします。",
            });
            await fetchQueues();
        }
    }, [category.id, fetchQueues, toastManager]);

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
            toastManager.add({
                title: "削除に失敗しました",
                description: "タスクの削除中にエラーが発生しました。",
            });
        }
    }

    const handleDeleteCategory = async () => {
        const result = await deleteCategory(category.id);
        if (result.success) {
            setIsDeleted(true);
            toastManager.add({
                title: "カテゴリが削除されました",
                description: `${category.name} が正常に削除されました。`,
            });
        } else {
            toastManager.add({
                title: "削除に失敗しました",
                description: "カテゴリの削除中にエラーが発生しました。",
            });
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
                    toastManager.add({
                        title: "更新に失敗しました",
                        description: "タスク名の更新中にエラーが発生しました。",
                    });
                }
            } catch (error) {
                toastManager.add({
                    title: "更新に失敗しました",
                    description: "タスク名の更新中にエラーが発生しました。",
                });
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
                toastManager.add({
                    title: "Pop Limitを更新しました",
                    description: `Pop Limitが ${popLimitValue} に設定されました。`,
                });
            } else {
                toastManager.add({
                    title: "更新に失敗しました",
                    description: "Pop Limitの更新中にエラーが発生しました。",
                });
            }
        } catch (error) {
            toastManager.add({
                title: "更新に失敗しました",
                description: "Pop Limitの更新中にエラーが発生しました。",
            });
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
                            onClick={handleDeleteCategory}
                            >
                              <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444'}} />
                              <Box>Delete Category</Box>
                            </Menu.Item>
                                <Menu.Item value="pop-limit" onClick={handleOpenPopLimitDialog} cursor="pointer" rounded="xs">
                                    Change pop limit
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Menu.Root>
                </motion.div>
            </Flex>
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
                                <Box
                                    key={item.id}
                                    position="relative"
                                    overflow="hidden"
                                    onMouseEnter={() => setHoveringTargetId(item.id)}
                                    onMouseLeave={() => setHoveringTargetId(null)}
                                >
                                    <Box
                                        ref={index === queue.length - 1 ? setLastItemRef : null}
                                        data-scope="listbox"
                                        data-part="item"
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        position="relative"
                                        display="flex"
                                        cursor="pointer"
                                        userSelect="none"
                                        alignItems="center"
                                        borderRadius="xs"
                                        px={2}
                                        py={1.5}
                                        pr={hoveringTargetId === item.id ? "64px" : 2}
                                        bg={
                                            index >= queue.length - currentCategory.popLimit || !currentCategory.popLimit 
                                                ? "gray.50" 
                                                : "gray.200"
                                        }
                                        _hover={{ bg: index >= queue.length - currentCategory.popLimit || !currentCategory.popLimit ? 'gray.100' : 'gray.300' }}
                                        transition="all 0.2s"
                                    >
                                        {editingItemId === item.id ? (
                                            <Box
                                                as="input"
                                                type="text"
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                onBlur={() => handleBlur(item)}
                                                onKeyDown={(e) => handleKeyDown(e, item)}
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
                                        {hoveringTargetId === item.id && (
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
                                                        // 新しいボタンの処理をここに追加
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
                                                        handleDelete(item.id);
                                                    }}
                                                >
                                                    <ChevronsRight style={{ width: '16px', height: '16px' }} />
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Box>
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
            <Dialog.Root 
                open={isPopLimitDialogOpen} 
                onOpenChange={(e) => setIsPopLimitDialogOpen(e.open)}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="425px">
                        <Dialog.Header>
                            <Dialog.Title>Pop Limitの変更</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.CloseTrigger />
                        <Dialog.Body display="flex" flexDirection="column" gap={4} py={4}>
                            <Text fontSize="sm" color="gray.600">
                                キューから削除されないように保護する要素数を設定します。
                            </Text>
                            {popLimitError && (
                                <Text fontSize="sm" color="red.500">
                                    Pop Limitは0以上に設定してください。
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
                                    onChange={(e) => setPopLimitValue(e.target.value)}
                                    flex={1}
                                />
                            </Flex>
                        </Dialog.Body>
                        <Dialog.Footer display="flex" gap={3}>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsPopLimitDialogOpen(false)}
                            >
                                キャンセル
                            </Button>
                            <Button onClick={handleSavePopLimit}>
                                保存
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
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

function ToastList() {
    const { toasts } = Toast.useToastManager();
    return toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast} className={styles.Toast}>
            <Toast.Content className={styles.Content}>
                <Toast.Title className={styles.Title} />
                <Toast.Description className={styles.Description} />
                <Toast.Close className={styles.Close} aria-label="Close">
                    <XIcon className={styles.Icon} />
                </Toast.Close>
            </Toast.Content>
        </Toast.Root>
    ));
}

function XIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}