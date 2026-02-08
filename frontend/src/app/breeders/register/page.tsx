'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import BreederRegistrationForm from '@/components/breeders/BreederRegistrationForm';

export default function BreederRegistrationPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user?.isBreeder) {
            router.push('/dashboard/breeder');
        }
    }, [user, isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Join as an Ethical Breeder
                </h1>
                <p className="mt-4 text-xl text-gray-600">
                    Partner with us to find loving homes for your puppies and kittens.
                </p>
            </div>

            <BreederRegistrationForm />
        </div>
    );
}
