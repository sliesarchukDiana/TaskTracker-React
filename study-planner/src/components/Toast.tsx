import { useEffect, useState } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';

export default function Toast() {
    const { toast, clearToast, tasks, confirmDelete, undoDelete } = useTaskContext();
    const [progress, setProgress] = useState(100);

    const deletingTasks = tasks.filter(t => t.isDeleting);
    const isDeleting = deletingTasks.length > 0;

    useEffect(() => {
        if (isDeleting) {
            const interval = setInterval(() => {
                setProgress(prev => Math.max(0, prev - 1));
            }, 50);

            const timer = setTimeout(() => {
                confirmDelete(); // <-- Прибрано 0
                clearToast();
            }, 5000);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
                setProgress(100);
            };
        }
    }, [isDeleting, confirmDelete, clearToast]);

    useEffect(() => {
        if (toast && !isDeleting) {
            const timer = setTimeout(clearToast, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, isDeleting, clearToast]);

    if (isDeleting) {
        const text = deletingTasks.length === 1
            ? `Видалення: ${deletingTasks[0].title}`
            : `Видалення: ${deletingTasks.length} виконаних завдань`;

        return (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80 z-50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm truncate pr-2">
                        {text}
                    </span>
                    <button
                        onClick={() => {
                            undoDelete();
                            clearToast();
                        }}
                        className="text-sm font-bold text-red-400 hover:text-red-300 px-3 py-1 bg-gray-700 rounded transition-colors whitespace-nowrap"
                    >
                        Undo
                    </button>
                </div>
                <div className="w-full bg-gray-600 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-red-400 h-full transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    if (toast) {
        const bgColors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600'
        };
        return (
            <div className={`fixed bottom-4 right-4 ${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity`}>
                {toast.message}
            </div>
        );
    }

    return null;
}