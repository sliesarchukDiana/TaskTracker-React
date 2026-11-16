import { useEffect, useState } from 'react';
import { taskRepository } from '../repositories/taskRepository';
import type { Task } from '../types/task';

interface Props {
    taskId: number;
    onClose: () => void;
}

export default function TaskDetailsModal({ taskId, onClose }: Props) {
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await taskRepository.getById(taskId, controller.signal);
                setTask(data);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError('Не вдалося завантажити деталі завдання.');
            } finally {
                setIsLoading(false);
            }
        };

        void loadDetails();

        return () => controller.abort();
    }, [taskId]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                {isLoading ? (
                    <div className="text-center py-8 text-blue-600">Завантаження деталей...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                ) : task ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
                        <div className="flex gap-2 mb-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">{task.category}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">Priority: {task.priority}</span>
                            <span className={`px-2 py-1 text-xs rounded-md ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {task.completed ? 'Completed' : 'Pending'}
                            </span>
                        </div>
                        <p className="text-gray-700 mb-6">{task.description || 'Немає опису'}</p>
                    </div>
                ) : null}
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
                        Закрити
                    </button>
                </div>
            </div>
        </div>
    );
}