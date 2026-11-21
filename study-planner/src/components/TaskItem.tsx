import { Link, useLocation, useNavigate } from 'react-router';
import type { Task } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const { toggleTask, requestDelete } = useTaskContext();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };

    const requireAuth = (action: () => void) => {
        if (!isAuthenticated) {
            void navigate('/login', { state: { from: location.pathname + location.search } });
            return;
        }
        action();
    };

    return (
        <div
            className={`p-4 bg-white rounded-lg border shadow-sm flex items-start gap-4 transition-all duration-300 ${
                task.completed ? 'opacity-60' : 'opacity-100'
            } ${task.isDeleting ? 'bg-red-50 border-red-200 scale-[0.98]' : 'border-gray-200'}`}
        >
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => requireAuth(() => { void toggleTask(task.id); })}
                disabled={task.isDeleting}
                className="mt-1 w-5 h-5 cursor-pointer disabled:opacity-50"
            />

            <div className="flex-1 min-w-0">
                <Link
                    to={`/tasks/${task.id}`}
                    className={`text-lg font-semibold hover:text-blue-600 transition-colors block truncate ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                >
                    {task.title}
                </Link>
                {task.description && (
                    <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-medium">
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

            <div className="flex flex-col gap-1 shrink-0">
                <Link
                    to={`/tasks/${task.id}`}
                    className="text-center text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                    Деталі
                </Link>
                <button
                    type="button"
                    onClick={() => requireAuth(() => requestDelete(task.id))}
                    disabled={task.isDeleting}
                    className="text-red-500 hover:text-red-700 px-3 py-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}