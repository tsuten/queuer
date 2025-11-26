"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ReactSortable } from "react-sortablejs";
import { getQueuesByCategory, deleteCategory, addQueue, deleteQueue, reorderQueues, updateQueue, updateCategory } from "../actions/queueActions";
import { Ellipsis, Trash2, X, ChevronsDown } from 'lucide-react';
import { Toast } from '@base-ui-components/react/toast';
import styles from './queue.module.css';
import { Listbox, createListCollection, Box, Flex, Menu, Button, IconButton, Input } from "@chakra-ui/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import QueueCategoryName from "./queueCategoryName";


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
        <Flex flexDirection="column" alignItems="flex-start" justifyContent="flex-start">
            <Flex flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
                <QueueCategoryName category={category} />
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
            <Box 
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
                </Box>
            <Listbox.Root collection={queueCollection} width="100%" >
                <Listbox.Content asChild>
                    <ReactSortable animation={200} list={queue} setList={handleListChange} style={{ width: '100%', display: 'flex', flexDirection: 'column' }} tag="div">
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
                                    data-scope="listbox"
                                    data-part="item"
                                    onMouseEnter={() => setHoveringTargetId(item.id)}
                                    onMouseLeave={() => setHoveringTargetId(null)}
                                    onDoubleClick={() => handleDoubleClick(item)}
                                    position="relative"
                                    display="flex"
                                    cursor="pointer"
                                    userSelect="none"
                                    alignItems="center"
                                    borderRadius="xs"
                                    px={2}
                                    py={1.5}
                                    bg={
                                        index >= queue.length - currentCategory.popLimit || !currentCategory.popLimit 
                                            ? "transparent" 
                                            : "gray.200"
                                    }
                                    _hover={{ bg: index >= queue.length - currentCategory.popLimit || !currentCategory.popLimit ? 'gray.100' : 'gray.300' }}
                                    transition="background-color 0.2s"
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
                                    <Button 
                                        variant="ghost" 
                                        style={{ width: '16px', height: '16px', cursor: 'pointer', marginLeft: '8px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                    >
                                        {hoveringTargetId === item.id ? (
                                            <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                                        ) : (
                                            <X style={{ width: '16px', height: '16px', color: '#6b7280', display: 'none' }} />
                                        )}
                                    </Button>
                                </Box>
                            ))}
                        {/* )} */}
                    </ReactSortable>
                </Listbox.Content>
            </Listbox.Root>
            {queue.length > 0 && (
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
            )}
            <div className="flex flex-col">
                {/* <QueuePushInput onPush={handlePush} /> */}
                <div className="flex justify-end items-end">
                    </div>
                </div>
            <Dialog open={isPopLimitDialogOpen} onOpenChange={setIsPopLimitDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Pop Limitの変更</DialogTitle>
                        <DialogDescription>
                            キューから削除されないように保護する要素数を設定します。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {popLimitError && (
                            <div className="text-sm text-red-500">
                                Pop Limitは0以上に設定してください。
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="popLimit" className="text-right">
                                Pop Limit
                            </Label>
                            <Input
                                id="popLimit"
                                type="number"
                                min="0"
                                value={popLimitValue}
                                onChange={(e) => setPopLimitValue(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPopLimitDialogOpen(false)}>
                            キャンセル
                        </Button>
                        <Button onClick={handleSavePopLimit}>
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </Flex>
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