import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useTaskContext } from '../hooks/useTaskContext';

export default function ProfilePage() {
    const { user, isAuthenticated, isInitializing, logout } = useAuth();
    const { showToast } = useTaskContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        showToast('Ви вийшли з акаунту', 'info');
        void navigate('/login', { replace: true });
    };

    if (isInitializing) {
        return <div className="text-center py-12 text-blue-600">Завантаження профілю...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Профіль користувача</h1>

            <dl className="space-y-3 text-sm mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-500">Username</dt>
                    <dd className="font-medium text-gray-900">{user?.username ?? '—'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium text-gray-900">{user?.email ?? '—'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-500">Статус авторизації</dt>
                    <dd>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Авторизовано
                        </span>
                    </dd>
                </div>
            </dl>

            <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
                Logout
            </button>
        </div>
    );
}