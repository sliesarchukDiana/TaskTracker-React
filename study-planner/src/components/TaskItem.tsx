import type {Task} from '../types/task';

interface TaskItemProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };

    return (
        <div className={`p-4 bg-white rounded-lg border shadow-sm flex items-start gap-4 transition-opacity ${task.completed ? 'opacity-60' : 'opacity-100'}`}>
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
                className="mt-1 w-5 h-5 cursor-pointer"
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
                </div>
            </div>

            <button
                onClick={() => onDelete(task.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                title="Видалити завдання"
            >
                ✕
            </button>
        </div>
    );
}