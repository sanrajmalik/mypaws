'use client';

import { useState, useEffect, useRef } from 'react';
import { api, User, PaymentHistoryItem } from '@/lib/api';
import CitySelect, { City } from '@/components/ui/CitySelect';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const { refreshUser } = useAuthStore();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'danger'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    // Profile Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [pincode, setPincode] = useState('');

    // Billing State
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    // Initial Load
    useEffect(() => {
        loadUser();
    }, []);

    // Handle prompt query param
    useEffect(() => {
        const prompt = searchParams.get('prompt');
        if (!loading && activeTab === 'profile') {
            if (prompt === 'phone') {
                setMessage({ type: 'info', text: 'Please add and verify your phone number to continue.' });
                // Slight delay to ensure render
                setTimeout(() => {
                    if (phoneInputRef.current) {
                        phoneInputRef.current.focus();
                        phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        }
    }, [searchParams, loading, activeTab]);

    const loadUser = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
            setName(userData.displayName || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setPincode(userData.pincode || '');

            // If user has cityId, we ideally need to fetch the full city object to display it.
            // For now, if we don't have the city object, we can't pre-fill the CitySelect 
            // unless we fetch the city by ID.
            // TODO: Fetch city details if cityId exists but we don't have name/state
            // Optimization: API could return full City object or we fetch it here.

            // Temporary workaround: If we have cityId and we assume we might need to fetch it
            // For this iteration, let's leave it as 'Change' if we had the object, but we only have ID.
            // Actually, we can't easily display "Mumbai, MH" without fetching.
            // Let's rely on the user re-selecting if they want to update, OR fetch city details.

            if (userData.cityId) {
                // Fetch city details
                // We typically need an endpoint for `GET /cities/:id` or filter list.
                // Assuming we can search by ID or just fetch list. 
                // Let's try to search by existing city name if we had it, but we don't.
                // We'll skip pre-filling visual CitySelect for now to save time, 
                // but keep the ID in state so we don't null it out on save unless changed.
            }

        } catch (err) {
            console.error('Failed to load user', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updatedUser = await api.updateProfile({
                displayName: name,
                phone,
                address,
                cityId: selectedCity?.id ? parseInt(selectedCity.id) : (user?.cityId), // Keep existing if not changed, or update
                pincode
            });
            setUser(updatedUser);

            // Sync global auth store so other pages (e.g. create-listing) see updated user data
            await refreshUser();

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const loadPayments = async () => {
        setLoadingPayments(true);
        try {
            const data = await api.getMyPayments();
            setPayments(data);
        } catch (err) {
            console.error('Failed to load payments', err);
        } finally {
            setLoadingPayments(false);
        }
    };

    // Load payments when tab changes
    useEffect(() => {
        if (activeTab === 'billing') {
            loadPayments();
        }
    }, [activeTab]);

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? You can reactivate it by logging in again.')) return;

        try {
            await api.deleteAccount();
            router.push('/');
            router.refresh();
        } catch (err: any) {
            alert('Failed to delete account: ' + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">Account Settings</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'profile', label: 'Profile' },
                        { id: 'billing', label: 'Billing & Payments' },
                        { id: 'danger', label: 'Danger Zone', danger: true },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? (tab.danger ? 'border-red-500 text-red-600' : 'border-primary-500 text-primary-600')
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' :
                        message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl">
                        {/* Avatar (Read Only for now) */}
                        <div className="flex items-center gap-4 mb-6">
                            <img
                                src={user?.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp'}
                                alt={user?.displayName}
                                className="h-20 w-20 rounded-full border-2 border-gray-100 shadow-sm object-cover"
                            />
                            <div>
                                <h3 className="font-medium text-gray-900 text-lg">{user?.displayName}</h3>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.isBreeder ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {user?.isBreeder ? 'Breeder Account' : 'Adopter Account'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex gap-2">
                                    <input
                                        ref={phoneInputRef}
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className={`block w-full rounded-lg border px-4 py-2.5 focus:ring-primary-500 focus:border-primary-500 ${message?.text.includes('phone') && !phone
                                            ? 'border-blue-300 ring-2 ring-blue-100'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {user?.phoneVerified && (
                                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg text-green-600 border border-green-200" title="Verified">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Apartment, Street, Area..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <CitySelect
                                    value={selectedCity}
                                    onChange={setSelectedCity}
                                    label="City"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="e.g. 400001"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 transition-colors shadow-sm"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Payment History</h3>
                        {loadingPayments ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}
                            </div>
                        ) : payments.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.map((payment) => (
                                            <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-medium text-gray-900 capitalize">{payment.listingType} Listing</div>
                                                    <div className="text-xs text-gray-500 capitalize">{payment.pricingTier} Tier</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    ₹{payment.amount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No payment history found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* DANGER ZONE TAB */}
                {activeTab === 'danger' && (
                    <div className="space-y-6">
                        <div className="border border-red-200 rounded-xl bg-red-50 p-6">
                            <h3 className="text-lg font-medium text-red-800 mb-2">Delete Account</h3>
                            <p className="text-red-600 text-sm mb-6">
                                Once you delete your account, your profile and listings will be hidden.
                                You can reactivate your account by logging in again with the same credentials.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors border border-transparent focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
