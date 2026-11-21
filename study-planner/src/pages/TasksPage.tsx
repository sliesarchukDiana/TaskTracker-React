import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import TaskStats from '../components/TaskStats';
import TaskFilters, { type PriorityFilter, type StatusFilter } from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import TaskFormDialog from '../components/TaskFormDialog';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import type { TaskFormData } from '../schemas/taskSchema';

export default function TasksPage() {
    const {
        tasks,
        addTask,
        clearCompleted,
        resetTasks,
        isLoading,
        error,
        page,
        setPage,
        fetchTasks,
    } = useTaskContext();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const statusFilter = (searchParams.get('status') as StatusFilter) || 'all';
    const priorityFilter = (searchParams.get('priority') as PriorityFilter) || 'all';

    const filteredTasks = tasks.filter((task) => {
        if (statusFilter === 'completed' && !task.completed) return false;
        if (statusFilter === 'uncompleted' && task.completed) return false;
        return !(priorityFilter !== 'all' && task.priority !== priorityFilter);
        
    });

    const redirectToLogin = () => {
        void navigate('/login', { state: { from: location.pathname + location.search } });
    };

    const handleOpenCreate = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = async (data: TaskFormData) => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        await addTask({
            ...data,
            completed: false,
            createdBy: user?.username ?? 'authenticated_user',
            createdAt: new Date().toISOString(),
        });
    };

    const handleClearCompleted = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        clearCompleted();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Завдання</h1>
                    <p className="text-sm text-gray-600">Планувальник навчальних завдань</p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    aria-label="Створити завдання"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl leading-none hover:bg-blue-700 transition-colors shadow-sm"
                    title="Додати завдання"
                >
                    +
                </button>
            </div>

            <TaskStats />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <TaskFilters />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleClearCompleted}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                        Очистити завершені
                    </button>
                    <button
                        type="button"
                        onClick={resetTasks}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Скинути список
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mt-4">
                    <div className="flex flex-col items-center gap-3 text-blue-600">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-medium">Завантаження завдань...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center p-8 bg-red-50 border-2 border-red-100 text-red-600 rounded-lg mt-4">
                    <p className="mb-4 font-medium">{error}</p>
                    <button
                        type="button"
                        onClick={() => { void fetchTasks(page * 10); }}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                        Спробувати ще раз
                    </button>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 mt-4">
                    Завдань не знайдено.
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 mt-4">
                    Немає завдань для обраного фільтра.
                </div>
            ) : (
                <>
                    <TaskList tasks={filteredTasks} />

                    <div className="flex justify-between items-center mt-6 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <button
                            type="button"
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Попередня
                        </button>

                        <span className="text-sm font-medium text-gray-600">
                            Сторінка {page + 1}
                        </span>

                        <button
                            type="button"
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 transition-colors"
                        >
                            Наступна
                        </button>
                    </div>
                </>
            )}

            <TaskFormDialog
                open={isCreateOpen}
                mode="create"
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateSubmit}
            />
        </div>
    );
}