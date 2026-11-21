import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
import { useTaskContext } from '../hooks/useTaskContext';

export default function LoginPage() {
    const { login } = useAuth();
    const { showToast } = useTaskContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [serverError, setServerError] = useState<string | null>(null);

    const stateFrom = (location.state as { from?: string } | null)?.from;
    const queryFrom = searchParams.get('from');
    const redirectTo = stateFrom || queryFrom || '/tasks';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        try {
            await login(data);
            showToast('Вхід виконано успішно', 'success');
            void navigate(redirectTo, { replace: true });
        } catch {
            setServerError('Невірний логін або пароль. Спробуйте ще раз.');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Вхід</h1>
            <p className="text-sm text-gray-500 mb-6">
                Тестові дані DummyJSON: <code className="bg-gray-100 px-1 rounded">emilys</code> /{' '}
                <code className="bg-gray-100 px-1 rounded">emilyspass</code>
            </p>

            {serverError && (
                <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        disabled={isSubmitting}
                        {...register('username')}
                        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    />
                    {errors.username && (
                        <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...register('password')}
                        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    />
                    {errors.password && (
                        <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Вхід...' : 'Увійти'}
                </button>
            </form>
        </div>
    );
}