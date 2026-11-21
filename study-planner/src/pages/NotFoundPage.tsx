import { Link } from 'react-router';

export default function NotFoundPage() {
    return (
        <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <p className="text-gray-600 mb-6">Сторінку не знайдено.</p>
            <Link
                to="/tasks"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
                На головну
            </Link>
        </div>
    );
}