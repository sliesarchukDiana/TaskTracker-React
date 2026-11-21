import { createContext, useReducer, useEffect, useState, type ReactNode, useCallback } from 'react';
import type * as React from 'react';
import { taskReducer } from '../reducers/taskReducer';
import type { Task } from '../types/task';
import { taskRepository } from '../repositories/taskRepository';

export interface ToastType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'isDeleting'>) => Promise<Task>;
    updateTask: (task: Task) => Promise<void>;
    toggleTask: (id: number) => Promise<void>;
    requestDelete: (id: number) => void;
    confirmDelete: (tasksToDelete: Task[]) => Promise<void>;
    undoDelete: () => void;
    clearCompleted: () => void;
    resetTasks: () => void;
    toast: ToastType | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    clearToast: () => void;
    isLoading: boolean;
    error: string | null;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    fetchTasks: (skip: number, signal?: AbortSignal) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, dispatch] = useReducer(taskReducer, []);
    const [toast, setToast] = useState<ToastType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const limit = 10;

    useEffect(() => {
        const activeCount = tasks.filter((t) => !t.completed).length;
        document.title = `Study Planner — ${activeCount} active tasks`;
    }, [tasks]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ id: Date.now(), message, type });
    }, []);

    const clearToast = useCallback(() => setToast(null), []);

    const fetchTasks = useCallback(async (skip: number, signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await taskRepository.getAll(skip, limit, signal);
            dispatch({ type: 'reset', payload: data.tasks });
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return;
            setError('Помилка завантаження завдань. Спробуйте ще раз.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const loadTasks = async () => {
            await fetchTasks(page * limit, controller.signal);
        };

        void loadTasks();
        return () => controller.abort();
    }, [page, fetchTasks]);

    const addTask = useCallback(async (task: Omit<Task, 'id' | 'isDeleting'>) => {
        try {
            const newTask = await taskRepository.create(task);
            dispatch({ type: 'add', payload: newTask });
            showToast('Завдання створено', 'success');
            return newTask;
        } catch (err) {
            showToast('Помилка створення завдання', 'error');
            throw err;
        }
    }, [showToast]);

    const updateTask = useCallback(async (task: Task) => {
        try {
            await taskRepository.update(task.id, task);
            dispatch({ type: 'update', payload: task });
            showToast('Завдання оновлено', 'success');
        } catch (err) {
            showToast('Помилка оновлення завдання', 'error');
            throw err;
        }
    }, [showToast]);

    const toggleTask = useCallback(async (id: number) => {
        const taskToToggle = tasks.find((t) => t.id === id);
        if (!taskToToggle) return;

        dispatch({ type: 'toggle', payload: id });

        try {
            await taskRepository.update(id, { completed: !taskToToggle.completed });
        } catch {
            dispatch({ type: 'toggle', payload: id });
            showToast('Помилка синхронізації з сервером', 'error');
        }
    }, [tasks, showToast]);

    const requestDelete = useCallback((id: number) => {
        dispatch({ type: 'requestDelete', payload: id });
        showToast('Завдання буде видалено...', 'error');
    }, [showToast]);

    const confirmDelete = useCallback(async (tasksToDelete: Task[]) => {
        try {
            await Promise.all(tasksToDelete.map((task) => taskRepository.delete(task.id)));
            dispatch({ type: 'confirmDelete' });
        } catch {
            dispatch({ type: 'undoDelete' });
            showToast('Помилка сервера. Не вдалося видалити.', 'error');
        }
    }, [showToast]);

    const undoDelete = useCallback(() => {
        dispatch({ type: 'undoDelete' });
        showToast('Видалення скасовано', 'info');
    }, [showToast]);

    const clearCompleted = useCallback(() => {
        dispatch({ type: 'clearCompleted' });
        showToast('Завершені завдання будуть видалені...', 'error');
    }, [showToast]);

    const resetTasks = useCallback(() => {
        setPage(0);
        void fetchTasks(0);
        showToast('Список оновлено', 'info');
    }, [fetchTasks, showToast]);

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                toggleTask,
                requestDelete,
                confirmDelete,
                undoDelete,
                clearCompleted,
                resetTasks,
                toast,
                showToast,
                clearToast,
                isLoading,
                error,
                page,
                setPage,
                fetchTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}