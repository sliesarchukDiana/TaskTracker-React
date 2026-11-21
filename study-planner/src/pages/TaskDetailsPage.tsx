import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { taskRepository } from '../repositories/taskRepository';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import TaskFormDialog from '../components/TaskFormDialog';
import type { Task } from '../types/task';
import type { TaskFormData } from '../schemas/taskSchema';

export default function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { updateTask, showToast, fetchTasks, page } = useTaskContext();

    const numericId = Number(taskId);
    const isInvalidId = !taskId || Number.isNaN(numericId);

    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(!isInvalidId);
    const [error, setError] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isInvalidId) return;

        const controller = new AbortController();

        const loadDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await taskRepository.getById(numericId, controller.signal);
                setTask(data);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError('Не вдалося завантажити деталі завдання.');
            } finally {
                setIsLoading(false);
            }
        };

        void loadDetails();
        return () => controller.abort();
    }, [numericId, isInvalidId]);

    const redirectToLogin = () => {
        void navigate('/login', { state: { from: location.pathname } });
    };

    const handleEditClick = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        setIsEditOpen(true);
    };

    const handleEditSubmit = async (data: TaskFormData) => {
        if (!task) return;
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        const updated: Task = { ...task, ...data };
        await updateTask(updated);
        setTask(updated);
    };

    const handleDelete = async () => {
        if (!task || isDeleting) return;
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        setIsDeleting(true);
        try {
            await taskRepository.delete(task.id);
            showToast('Завдання видалено', 'success');
            void fetchTasks(page * 10);
            void navigate('/tasks');
        } catch {
            showToast('Не вдалося видалити завдання', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isInvalidId) {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
                <p className="text-red-600 font-medium mb-4">Некоректний ідентифікатор завдання.</p>
                <Link
                    to="/tasks"
                    className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-800"
                >
                    Повернутися до списку
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center py-12 text-blue-600 font-medium">Завантаження деталей...</div>;
    }

    if (error || !task) {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
                <p className="text-red-600 font-medium mb-4">{error ?? 'Завдання не знайдено.'}</p>
                <Link
                    to="/tasks"
                    className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-800"
                >
                    Повернутися до списку
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                <Link
                    to="/tasks"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    ← До списку завдань
                </Link>
                <span className="text-xs text-gray-400">ID: #{task.id}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{task.title}</h1>

            <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                    {task.category}
                </span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md">
                    Priority: {task.priority}
                </span>
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        task.completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {task.completed ? 'Виконано' : 'У процесі'}
                </span>
            </div>

            <p className="text-gray-700 mb-6 whitespace-pre-line">
                {task.description || 'Немає опису'}
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 text-sm mb-6">
                <div>
                    <dt className="text-gray-500">Створив</dt>
                    <dd className="font-medium text-gray-900">{task.createdBy}</dd>
                </div>
                <div>
                    <dt className="text-gray-500">Дата створення</dt>
                    <dd className="font-medium text-gray-900">
                        {new Date(task.createdAt).toLocaleString('uk-UA')}
                    </dd>
                </div>
            </dl>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleEditClick}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                    Редагувати
                </button>
                <button
                    type="button"
                    onClick={() => { void handleDelete(); }}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                >
                    {isDeleting ? 'Видалення...' : 'Видалити'}
                </button>
            </div>

            <TaskFormDialog
                open={isEditOpen}
                mode="edit"
                task={task}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleEditSubmit}
            />
        </div>
    );
}