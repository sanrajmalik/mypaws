'use client';

import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

export default function SuspendedPage() {
    const handleLogout = async () => {
        try {
            await api.logout();
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
            window.location.href = '/login';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>

                    <p className="text-gray-600 mb-6">
                        Your account has been suspended due to a violation of our terms of service or suspicious activity.
                    </p>

                    <div className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500 mb-4">
                            If you believe this is a mistake, please contact our support team.
                        </p>

                        <a
                            href="mailto:support@mypaws.in"
                            className="text-primary-600 hover:text-primary-500 font-medium block mb-6"
                        >
                            support@mypaws.in
                        </a>

                        <button
                            onClick={handleLogout}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
