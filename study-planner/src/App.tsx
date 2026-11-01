import { useState } from 'react';
import type {Task} from './types/task';
import { initialTasks } from './data/initialTasks';
import Header from './components/Header';
import TaskStats from './components/TaskStats';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskFilters, {type FilterType } from './components/TaskFilters';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>('all');

  const toggleTaskStatus = (id: number) => {
    setTasks(prevTasks =>
        prevTasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const addTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'uncompleted') return !task.completed;
    return true;
  });

  return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Header />
        <TaskStats tasks={tasks} />

        <main>
          <TaskForm onAdd={addTask} />
          <TaskFilters currentFilter={filter} onFilterChange={setFilter} />

          {tasks.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 mt-4">
                Завдань поки немає.<br />Додайте перше навчальне завдання.
              </div>
          ) : filteredTasks.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 mt-4">
                За цим фільтром завдань немає.
              </div>
          ) : (
              <TaskList
                  tasks={filteredTasks}
                  onToggle={toggleTaskStatus}
                  onDelete={deleteTask}
              />
          )}
        </main>
      </div>
  );
}