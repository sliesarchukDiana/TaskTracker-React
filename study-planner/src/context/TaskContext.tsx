import { createContext, useReducer, useEffect, useState, type ReactNode, useCallback } from 'react';
import { taskReducer } from '../reducers/taskReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Task } from '../types/task';
import type { FilterType } from '../components/TaskFilters';
import { taskRepository } from '../repositories/taskRepository';
import * as React from "react";

export interface ToastType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface TaskContextType {
    tasks: Task[];
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    addTask: (task: Omit<Task, 'id' | 'isDeleting'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    toggleTask: (id: number) => Promise<void>;
    requestDelete: (id: number) => void;
    confirmDelete: (tasksToDelete: Task[]) => Promise<void>;
    undoDelete: () => void;
    clearCompleted: () => void;
    resetTasks: () => void;
    toast: ToastType | null;
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
    const [filter, setFilter] = useLocalStorage<FilterType>('activeFilter', 'all');
    const [toast, setToast] = useState<ToastType | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const limit = 10;

    useEffect(() => {
        const activeCount = tasks.filter(t => !t.completed).length;
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
            try {
                await fetchTasks(page * 10, controller.signal);
            } catch {
                showToast('Сталась помилка!', 'error');
            }
        };
        loadTasks();
        return () => controller.abort();
    }, [page, fetchTasks, showToast]);

    const addTask = useCallback(async (task: Omit<Task, 'id' | 'isDeleting'>) => {
        try {
            const newTask = await taskRepository.create(task);
            dispatch({ type: 'add', payload: newTask });
            showToast('Завдання створено', 'success');
        } catch {
            showToast('Помилка створення завдання', 'error');
        }
    }, [showToast]);

    const updateTask = useCallback(async (task: Task) => {
        try {
            await taskRepository.update(task.id, task);
            dispatch({ type: 'update', payload: task });
            showToast('Завдання оновлено', 'success');
        } catch {
            showToast('Помилка оновлення', 'error');
        }
    }, [showToast]);

    const toggleTask = useCallback(async (id: number) => {
        const taskToToggle = tasks.find(t => t.id === id);
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
            await Promise.all(tasksToDelete.map(task => taskRepository.delete(task.id)));
            dispatch({ type: 'confirmDelete' });
        } catch (error) {
            console.error('Помилка видалення на сервері:', error);
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
        fetchTasks(0);
        showToast('Список оновлено', 'info');
    }, [fetchTasks, showToast]);

    const value = {
        tasks,
        filter,
        setFilter,
        addTask,
        updateTask,
        toggleTask,
        requestDelete,
        confirmDelete,
        undoDelete,
        clearCompleted,
        resetTasks,
        toast,
        clearToast,
        isLoading,
        error,
        page,
        setPage,
        fetchTasks,
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}