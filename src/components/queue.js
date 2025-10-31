"use client";

import { useState, useEffect, useCallback } from "react";
import { ReactSortable } from "react-sortablejs";
import { getQueuesByCategory, deleteCategory, addQueue, deleteQueue, reorderQueues } from "../actions/queueActions";
import { Ellipsis, Trash2, CircleX } from 'lucide-react';
import { Toast } from '@base-ui-components/react/toast';
import QueuePushInput from './queuePushInput';
import styles from './queue.module.css';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

    const handlePush = async (item) => {
        if (!item.trim()) return; // 空の入力を防ぐ
        try {
            const result = await addQueue(category.id, { name: item.trim() });
            if (result.success && result.data) {
                setQueue(prev => [result.data, ...prev]);
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
    
    return (
        isDeleted ? (
            <div>
            </div>
        ) : (
        <div className="flex flex-col items-start justify-start">
            <div className="flex flex-row items-center justify-between w-full">
                <QueueCategoryName category={category} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-8 h-8 rounded-full cursor-pointer">
                            <Ellipsis className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleDeleteCategory} className="cursor-pointer text-red-500 focus:text-red-500">
                            <Trash2 className="w-4 h-4 text-red-500" />
                            Delete Category
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            Change pop limit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {error && (
                <div className="text-sm text-red-500 my-2">
                    {error}
                </div>
            )}
            {/* 5つ以上の要素があった時のsort動作が不安定 */}
            {queue.length > 5 && (
                <div>
                    <h1>Queue is full</h1>
                </div>
            )}
            <ReactSortable animation={200} list={queue} setList={handleListChange} className="w-full">
                {queue.length > 5 ? (
                    queue.slice(queue.length - 5, queue.length).map((item) => (
                        <div key={item.id} className="flex items-center justify-center border-2 border-gray-300 rounded-md p-2 m-2 w-full">
                            <h1>{item.name}</h1>
                        </div>
                    ))
                ) : (
                    queue.map((item, index) => (
                        index + 1 >= category.popLimit || !category.popLimit ? (
                            <div key={item.id} onMouseEnter={() => setHoveringTargetId(item.id)} onMouseLeave={() => setHoveringTargetId(null)} className="flex justify-between border-2 border-gray-300 rounded-md p-2 my-1 cursor-pointer w-full">
                                <h1>{item.name}</h1>
                                <Button variant="ghost" className="w-4 h-4 cursor-pointer" onClick={() => handleDelete(item.id)}>
                                    {hoveringTargetId === item.id ? (
                                        <CircleX className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <CircleX className="w-4 h-4 text-gray-500 hidden" />
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div key={item.id} onMouseEnter={() => setHoveringTargetId(item.id)} onMouseLeave={() => setHoveringTargetId(null)} className="flex justify-between border-2 border-gray-300 rounded-md p-2 bg-gray-200 my-1 cursor-pointer w-full">
                                <h1>{item.name}</h1>
                                <Button variant="ghost" className="w-4 h-4 cursor-pointer" onClick={() => handleDelete(item.id)}>
                                    {hoveringTargetId === item.id ? (
                                        <CircleX className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <CircleX className="w-4 h-4 text-gray-500 hidden" />
                                    )}
                                </Button>
                            </div>
                        )
                    ))
                )}
            </ReactSortable>
            <Button onClick={() => handlePop()} variant="destructive" className="cursor-pointer flex w-full">Pop</Button>
            <div className="flex flex-col">
                <QueuePushInput onPush={handlePush} />
                <div className="flex justify-end items-end">
                    </div>
                </div>
            </div>
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