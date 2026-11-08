import type {Task} from '../types/task';

export type TaskAction =
    | {type: 'add'; payload: Omit<Task, 'id' | 'isDeleting'>}
    | {type: 'toggle'; payload: number}
    | {type: 'update'; payload: Task}
    | {type: 'requestDelete'; payload: number}
    | {type: 'confirmDelete'}
    | {type: 'undoDelete'}
    | {type: 'clearCompleted'}
    | {type: 'reset'; payload: Task[]};

export function taskReducer (state: Task[] = [], action: TaskAction): Task[] {
    switch (action.type) {
        case 'add':
            return [...state, {...action.payload, id: Date.now(), isDeleting: false}];
        case 'toggle':
            return state.map(task =>
                task.id === action.payload ? {...task, completed: !task.completed} : task);
        case 'update':
            return state.map(task =>
                task.id === action.payload.id ? action.payload : task);
        case 'requestDelete':
            return state.map(task =>
                task.id === action.payload ? {...task, isDeleting: true } : task);
        case 'confirmDelete':
            return state.filter(task => !task.isDeleting);
        case 'undoDelete':
            return state.map(task => ({...task, isDeleting: false }));
        case 'clearCompleted':
            return state.map(task =>
                task.completed ? { ...task, isDeleting: true } : task
            );
        case 'reset':
            return action.payload;
        default:
            return state;
    }
}