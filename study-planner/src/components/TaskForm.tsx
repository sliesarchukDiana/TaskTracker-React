import { useState, type FormEvent } from 'react';
import type { TaskPriority } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';

export default function TaskForm() {
    const { addTask } = useTaskContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting) return;

        setIsSubmitting(true);

        try {
            await addTask({
                title: title.trim(),
                description: description.trim(),
                category: category.trim() || 'General',
                priority,
                completed: false,
            });
            setTitle('');
            setDescription('');
            setCategory('');
            setPriority('medium');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Додати нове завдання</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Назва завдання"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Категорія (напр. React)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Опис"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2"
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="border border-gray-300 rounded-md p-2 w-full md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="low">Низький пріоритет</option>
                    <option value="medium">Середній пріоритет</option>
                    <option value="high">Високий пріоритет</option>
                </select>
            </div>
            <button
                 type="submit" disabled={!title.trim() || isSubmitting} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2">
                 {isSubmitting ? 'Збереження...' : 'Додати завдання'}
            </button>
        </form>
    );
}