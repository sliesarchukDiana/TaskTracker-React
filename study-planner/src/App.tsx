import Header from './components/Header';
import TaskStats from './components/TaskStats';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import Toast from './components/Toast';
import { useTaskContext } from './hooks/useTaskContext';

export default function App() {
  const { tasks, filter, clearCompleted, resetTasks } = useTaskContext();

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
                Очистити виконані
              </button>
              <button
                  onClick={resetTasks}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Скинути дані
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 mt-4">
                Немає завдань.
              </div>
          ) : filteredTasks.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 mt-4">
                Завдань за цим фільтром не знайдено.
              </div>
          ) : (
              <TaskList tasks={filteredTasks} />
          )}
        </main>
        <Toast />
      </div>
  );
}