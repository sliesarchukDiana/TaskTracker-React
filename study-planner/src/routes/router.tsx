import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router';
import { authStorage } from '../api/authStorage';
import AppLayout from '../layouts/AppLayout';
import TasksPage from '../pages/TasksPage';
import TaskDetailsPage from '../pages/TaskDetailsPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

function requireAuthLoader({ request }: LoaderFunctionArgs) {
    if (!authStorage.hasToken()) {
        const url = new URL(request.url);
        const from = encodeURIComponent(url.pathname + url.search);
        return redirect(`/login?from=${from}`);
    }
    return null;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                loader: () => redirect('/tasks'),
            },
            {
                path: 'tasks',
                element: <TasksPage />,
            },
            {
                path: 'tasks/:taskId',
                element: <TaskDetailsPage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'profile',
                loader: requireAuthLoader,
                element: <ProfilePage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);