export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    category: string;
    /** Client-owned metadata: DummyJSON /todos API does not provide these fields */
    createdBy: string;
    /** Client-owned metadata: DummyJSON /todos API does not provide these fields */
    createdAt: string;
    isDeleting?: boolean;
}