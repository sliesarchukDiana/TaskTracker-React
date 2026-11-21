import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';

export type TaskFormDialogProps = {
    open: boolean;
    mode: 'create' | 'edit';
    task?: Task;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
};

export default function TaskFormDialog({
                                           open,
                                           mode,
                                           task,
                                           onClose,
                                           onSubmit,
                                       }: TaskFormDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            category: 'Study',
            priority: 'medium',
        },
    });

    useEffect(() => {
        if (!open) return;

        if (mode === 'edit' && task) {
            reset({
                title: task.title,
                description: task.description,
                category: task.category,
                priority: task.priority,
            });
        } else {
            reset({
                title: '',
                description: '',
                category: 'Study',
                priority: 'medium',
            });
        }
    }, [open, mode, task, reset]);

    useEffect(() => {
        if (!open) return;

        dialogRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, isSubmitting, onClose]);

    if (!open) return null;

    const handleFormSubmit = async (data: TaskFormData) => {
        try {
            await onSubmit(data);
            onClose();
        } catch { /* empty */ }
    };

    const headingId = 'task-form-dialog-title';

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                tabIndex={-1}
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl outline-none"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id={headingId} className="text-xl font-bold text-gray-900">
                        {mode === 'create' ? 'Нове завдання' : 'Редагувати завдання'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Закрити"
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2 py-1 disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Назва
                        </label>
                        <input
                            id="task-title"
                            type="text"
                            disabled={isSubmitting}
                            {...register('title')}
                            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                        />
                        {errors.title && (
                            <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Опис
                        </label>
                        <textarea
                            id="task-description"
                            rows={3}
                            disabled={isSubmitting}
                            {...register('description')}
                            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                        />
                        {errors.description && (
                            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="task-category" className="block text-sm font-medium text-gray-700 mb-1">
                                Категорія
                            </label>
                            <input
                                id="task-category"
                                type="text"
                                disabled={isSubmitting}
                                {...register('category')}
                                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            />
                            {errors.category && (
                                <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                                Пріоритет
                            </label>
                            <select
                                id="task-priority"
                                disabled={isSubmitting}
                                {...register('priority')}
                                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            {errors.priority && (
                                <p className="text-red-600 text-xs mt-1">{errors.priority.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? 'Збереження...'
                                : mode === 'create'
                                    ? 'Створити'
                                    : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}