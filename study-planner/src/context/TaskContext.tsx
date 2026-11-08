import { createContext, useReducer, useEffect, useState, type ReactNode, useCallback } from 'react';
import { taskReducer } from '../reducers/taskReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialTasks } from '../data/initialTasks';
import type { Task } from '../types/task';
import type { FilterType } from '../components/TaskFilters';

export interface ToastType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface TaskContextType {
    tasks: Task[];
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    addTask: (task: Omit<Task, 'id' | 'isDeleting'>) => void;
    updateTask: (task: Task) => void;
    toggleTask: (id: number) => void;
    requestDelete: (id: number) => void;
    confirmDelete: (id: number) => void;
    undoDelete: (id: number) => void;
    clearCompleted: () => void;
    resetTasks: () => void;
    toast: ToastType | null;
    clearToast: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const initTasks = () => {
        try {
            const localData = window.localStorage.getItem('tasks');
            return localData ? JSON.parse(localData) : initialTasks;
        } catch (e) {
            console.error('Task provider fell off.', e);
            return initialTasks;
        }
    };

    const [tasks, dispatch] = useReducer(taskReducer, [], initTasks);
    const [filter, setFilter] = useLocalStorage<FilterType>('activeFilter', 'all');
    const [toast, setToast] = useState<ToastType | null>(null);

    useEffect(() => {
        window.localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        const activeCount = tasks.filter(t => !t.completed).length;
        document.title = `Study Planner — ${activeCount} active tasks`;
    }, [tasks]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ id: Date.now(), message, type });
    }, []);

    const clearToast = useCallback(() => setToast(null), []);

    const addTask = useCallback((task: Omit<Task, 'id' | 'isDeleting'>) => {
        dispatch({ type: 'add', payload: task });
        showToast('Завдання успішно створено', 'success');
    }, [showToast]);

    const updateTask = useCallback((task: Task) => {
        dispatch({ type: 'update', payload: task });
        showToast('Завдання оновлено', 'success');
    }, [showToast]);

    const toggleTask = useCallback((id: number) => {
        dispatch({ type: 'toggle', payload: id });
    }, []);

    const requestDelete = useCallback((id: number) => {
        dispatch({ type: 'requestDelete', payload: id });
        showToast('Завдання буде видалено...', 'error');
    }, [showToast]);

    const confirmDelete = useCallback((id: number) => {
        dispatch({ type: 'confirmDelete', payload: id });
        showToast('Завдання остаточно видалено', 'info');
    }, [showToast]);

    const undoDelete = useCallback((id: number) => {
        dispatch({ type: 'undoDelete', payload: id });
        showToast('Видалення скасовано', 'info');
    }, [showToast]);

    const clearCompleted = useCallback(() => {
        dispatch({ type: 'clearCompleted' });
        showToast('Виконані завдання очищено', 'info');
    }, [showToast]);

    const resetTasks = useCallback(() => {
        dispatch({ type: 'reset', payload: initialTasks });
        showToast('Дані скинуто до початкових', 'info');
    }, [showToast]);

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
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
            </TaskContext.Provider>
    );
}