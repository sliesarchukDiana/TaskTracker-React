import { useState, type FormEvent } from 'react';
import type { Task, TaskPriority } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const { toggleTask, requestDelete, updateTask } = useTaskContext();

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);
    const [editCategory, setEditCategory] = useState(task.category);
    const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDetails, setShowDetails] = useState(false);

    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!editTitle.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await updateTask({
                ...task,
                title: editTitle.trim(),
                description: editDescription.trim(),
                category: editCategory.trim() || 'General',
                priority: editPriority
            });
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isEditing) {
        return (
            <form onSubmit={handleUpdate} className="p-4 bg-white rounded-lg border border-blue-300 shadow-sm flex flex-col gap-3">
                <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={isSubmitting}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    required
                />
                <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Опис"
                    disabled={isSubmitting}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="Категорія"
                        disabled={isSubmitting}
                        className="border border-gray-300 rounded-md p-2 flex-1 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    />
                    <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                        disabled={isSubmitting}
                        className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Збереження...' : 'Зберегти'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <>
            <div className={`p-4 bg-white rounded-lg border shadow-sm flex items-start gap-4 transition-all duration-300 ${
                task.completed ? 'opacity-60' : 'opacity-100'
            } ${task.isDeleting ? 'bg-red-50 border-red-200 scale-[0.98]' : ''}`}>
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => { void toggleTask(task.id); }}
                    disabled={task.isDeleting}
                    className="mt-1 w-5 h-5 cursor-pointer disabled:opacity-50"
                />

                <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-3 text-xs font-medium">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                            {task.category}
                        </span>
                        <span className={`px-2 py-1 rounded-md ${priorityColors[task.priority]}`}>
                            {task.priority}
                        </span>
                        {task.isDeleting && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md animate-pulse">
                                Видаляється...
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    {/* Кнопка Info, яка змінює стан showDetails на true */}
                    <button
                        onClick={() => setShowDetails(true)}
                        disabled={task.isDeleting}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        title="Деталі"
                    >
                        Info
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        disabled={task.isDeleting || task.completed}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Редагувати"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => requestDelete(task.id)}
                        disabled={task.isDeleting}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Видалити"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Умовний рендеринг модального вікна, коли showDetails === true */}
            {showDetails && (
                <TaskDetailsModal
                    taskId={task.id}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </>
    );
}