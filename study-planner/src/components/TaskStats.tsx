import type {Task} from '../types/task';

interface TaskStatsProps {
    tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const uncompleted = total - completed;

    return (
        <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-blue-600">{total}</div>
                <div className="text-sm text-gray-500">Всього</div>
            </div>
            <div className="flex-1 text-center border-l border-gray-200">
                <div className="text-2xl font-bold text-green-600">{completed}</div>
                <div className="text-sm text-gray-500">Виконано</div>
            </div>
            <div className="flex-1 text-center border-l border-gray-200">
                <div className="text-2xl font-bold text-red-500">{uncompleted}</div>
                <div className="text-sm text-gray-500">Залишилось</div>
            </div>
        </div>
    );
}