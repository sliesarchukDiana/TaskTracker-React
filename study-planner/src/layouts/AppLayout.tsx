import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

export default function AppLayout() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        void navigate('/tasks');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <Link to="/tasks" className="text-xl font-bold text-gray-900">
                        Study Planner
                    </Link>

                    <nav className="flex items-center gap-2">
                        <NavLink to="/tasks" className={navLinkClass}>
                            Tasks
                        </NavLink>
                        <NavLink to="/profile" className={navLinkClass}>
                            Profile
                        </NavLink>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                                <span className="text-xs text-gray-500 hidden sm:inline">
                                    {user?.username}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <NavLink to="/login" className={navLinkClass}>
                                Login
                            </NavLink>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-3xl w-full mx-auto py-6 px-4 flex-1">
                <Outlet />
            </main>

            <Toast />
        </div>
    );
}