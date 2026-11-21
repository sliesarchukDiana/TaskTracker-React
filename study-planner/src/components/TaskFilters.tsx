import { useSearchParams } from 'react-router';
import type { TaskPriority } from '../types/task';

export type StatusFilter = 'all' | 'completed' | 'uncompleted';
export type PriorityFilter = 'all' | TaskPriority;

export default function TaskFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentStatus = (searchParams.get('status') as StatusFilter) || 'all';
    const currentPriority = (searchParams.get('priority') as PriorityFilter) || 'all';

    const updateParam = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value === 'all') {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };

    const statuses: { value: StatusFilter; label: string }[] = [
        { value: 'all', label: 'Усі' },
        { value: 'completed', label: 'Виконані' },
        { value: 'uncompleted', label: 'Невиконані' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5">
                {statuses.map((s) => (
                    <button
                        key={s.value}
                        type="button"
                        onClick={() => updateParam('status', s.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            currentStatus === s.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <select
                aria-label="Фільтр за пріоритетом"
                value={currentPriority}
                onChange={(e) => updateParam('priority', e.target.value)}
                className="border border-gray-300 bg-white rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
                <option value="all">Усі пріоритети</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
        </div>
    );
}