import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext.tsx';

export function useTaskContext() {
    const context = useContext(TaskContext);

    if (context === undefined) {
        throw new Error('useTaskContext() must be defined');
    }

    return context;
}