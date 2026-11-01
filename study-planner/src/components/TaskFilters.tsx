export type FilterType = 'all' | 'completed' | 'uncompleted';

interface TaskFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export default function TaskFilters({ currentFilter, onFilterChange }: TaskFiltersProps) {
    const filters: { value: FilterType; label: string }[] = [
        { value: 'all', label: 'Всі' },
        { value: 'completed', label: 'Виконані' },
        { value: 'uncompleted', label: 'Не виконані' },
    ];

    return (
        <div className="flex gap-2 mb-4">
            {filters.map((f) => (
                <button
                    key={f.value}
                    onClick={() => onFilterChange(f.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentFilter === f.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}