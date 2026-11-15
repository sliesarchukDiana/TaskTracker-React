import Header from './components/Header';
import TaskStats from './components/TaskStats';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import Toast from './components/Toast';
import { useTaskContext } from './hooks/useTaskContext';

export default function App() {
    const {
        tasks,
        filter,
        clearCompleted,
        resetTasks,
        isLoading,
        error,
        page,
        setPage,
        fetchTasks
    } = useTaskContext();

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'uncompleted') return !task.completed;
        return true;
    });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 relative">
            <Header />
            <TaskStats />

            <main>
                <TaskForm />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <TaskFilters />
                    <div className="flex gap-2">
                        <button
                            onClick={clearCompleted}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                            Очистити завершені
                        </button>
                        <button
                            onClick={() => { void resetTasks(); }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Скинути список
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mt-4">
                        <div className="flex flex-col items-center gap-3 text-blue-600">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-medium">Завантаження завдань...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center p-8 bg-red-50 border-2 border-red-100 text-red-600 rounded-lg mt-4">
                        <p className="mb-4 font-medium">{error}</p>
                        <button
                            onClick={() => { void fetchTasks(page * 10); }}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors shadow-sm"
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
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Попередня
                            </button>

                            <span className="text-sm font-medium text-gray-600">
                                Сторінка {page + 1}
                            </span>

                            <button
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 transition-colors"
                            >
                                Наступна
                            </button>
                        </div>
                    </>
                )}
            </main>

            <Toast />
        </div>
    );
}