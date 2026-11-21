import { httpClient } from '../api/httpClient';
import type { Task, TaskPriority } from '../types/task';

type ApiTodo = {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
};

type TodosResponse = {
    todos: ApiTodo[];
    total: number;
    skip: number;
    limit: number;
};

const CATEGORIES = ['Study', 'Work', 'Personal', 'Health', 'Household', 'Hobby'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const DESCRIPTIONS = [
    'Time is up.',
    'Has to be done as soon as possible.',
    'Low effort task, can be done in 5 minutes.',
    'Can be delegated to somebody else.',
    'Needs a lot of time and effort.',
    'Deadline is soon.',
];

function toTask(todo: ApiTodo): Task {
    const category = CATEGORIES[todo.id % CATEGORIES.length];
    const priority = PRIORITIES[todo.id % PRIORITIES.length];
    const description = DESCRIPTIONS[todo.id % DESCRIPTIONS.length];

    // Client-owned metadata: generated on the client because DummyJSON /todos does not return createdBy/createdAt
    const baseDate = new Date('2026-10-01T09:00:00.000Z');
    baseDate.setDate(baseDate.getDate() + (todo.id % 30));

    return {
        id: todo.id,
        title: todo.todo,
        description,
        completed: todo.completed,
        priority,
        category,
        createdBy: `user_${todo.userId}`,
        createdAt: baseDate.toISOString(),
    };
}

const localSessionTasks = new Map<number, Task>();
const deletedTaskIds = new Set<number>();

export const taskRepository = {
    getAll: async (skip = 0, limit = 10, signal?: AbortSignal) => {
        const data = await httpClient.request<TodosResponse>(
            `/todos?skip=${skip}&limit=${limit}`,
            { signal }
        );
        return {
            tasks: data.todos
                .filter((todo) => !deletedTaskIds.has(todo.id))
                .map((todo) => localSessionTasks.get(todo.id) ?? toTask(todo)),
            total: data.total,
        };
    },

    getById: async (id: number, signal?: AbortSignal) => {
        if (deletedTaskIds.has(id)) {
            throw new Error('Task not found');
        }

        if (localSessionTasks.has(id)) {
            return localSessionTasks.get(id)!;
        }

        const data = await httpClient.request<ApiTodo>(`/todos/${id}`, { signal });
        return toTask(data);
    },

    create: async (task: Omit<Task, 'id' | 'isDeleting'>) => {
        const data = await httpClient.request<ApiTodo>('/todos/add', {
            method: 'POST',
            requiresAuth: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                todo: task.title,
                completed: task.completed,
                userId: 1,
            }),
        });

        const uniqueId = localSessionTasks.has(data.id) ? Date.now() : data.id;
        const newTask: Task = {
            ...task,
            id: uniqueId,
            isDeleting: false,
        };

        deletedTaskIds.delete(newTask.id);
        localSessionTasks.set(newTask.id, newTask);
        return newTask;
    },

    update: async (id: number, task: Partial<Task>) => {
        try {
            await httpClient.request<ApiTodo>(`/todos/${id}`, {
                method: 'PUT',
                requiresAuth: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    todo: task.title,
                    completed: task.completed,
                }),
            });
        } catch (error) {
            if (!localSessionTasks.has(id)) {
                throw error;
            }
        }

        const cachedTask = localSessionTasks.get(id);
        if (cachedTask) {
            localSessionTasks.set(id, { ...cachedTask, ...task });
        } else if (task.id !== undefined) {
            localSessionTasks.set(id, task as Task);
        }
        return task;
    },

    delete: async (id: number) => {
        try {
            await httpClient.request(`/todos/${id}`, {
                method: 'DELETE',
                requiresAuth: true,
            });
        } catch (error) {
            if (!localSessionTasks.has(id)) {
                throw error;
            }
        }

        deletedTaskIds.add(id);
        localSessionTasks.delete(id);
    },
};