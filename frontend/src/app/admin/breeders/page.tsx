'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'; // XMarkIcon for modal close

interface BreederApplication {
    id: string;
    userId: string;
    businessName: string;
    kennelName?: string;
    yearsExperience: number;
    description: string;
    businessPhone: string;
    businessEmail?: string;
    websiteUrl?: string;
    cityId: string;
    address: string;
    pincode: string;
    status: string;
    createdAt: string;
    documentUrls?: Record<string, string>;
}

export default function BreederQueuePage() {
    const [applications, setApplications] = useState<BreederApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<BreederApplication | null>(null);

    const fetchApplications = async () => {
        try {
            const res: any = await api.getPendingBreederApplications();
            setApplications(res);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this breeder?')) return;
        try {
            await api.approveBreederApplication(id);
            setApplications(prev => prev.filter(app => app.id !== id));
            setSelectedApp(null);
        } catch (error) {
            alert('Failed to approve application');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await api.rejectBreederApplication(id, reason);
            setApplications(prev => prev.filter(app => app.id !== id));
            setSelectedApp(null);
        } catch (error) {
            alert('Failed to reject application');
        }
    };

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-bold text-gray-800">Breeder Verification Queue</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No pending applications found.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{app.businessName}</div>
                                            <div className="text-sm text-gray-500">{app.businessEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(app.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Approve"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(app.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Reject"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background backdrop */}
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedApp(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Application Details
                                            </h3>
                                            <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-500">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="mt-2 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Business Name</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedApp.businessName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Kennel Name</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedApp.kennelName || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Experience</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedApp.yearsExperience} years</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedApp.businessPhone}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-sm font-medium text-gray-500">Description</p>
                                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedApp.description}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-sm font-medium text-gray-500">Address</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedApp.address} - {selectedApp.pincode}</p>
                                            </div>
                                            {selectedApp.websiteUrl && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-sm font-medium text-gray-500">Website</p>
                                                    <a href={selectedApp.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-primary-600 hover:underline">
                                                        {selectedApp.websiteUrl}
                                                    </a>
                                                </div>
                                            )}
                                            {selectedApp.documentUrls && Object.keys(selectedApp.documentUrls).length > 0 && (
                                                <div className="sm:col-span-2 mt-4 border-t pt-4">
                                                    <p className="text-sm font-medium text-gray-500 mb-2">Documents</p>
                                                    <ul className="space-y-1">
                                                        {Object.entries(selectedApp.documentUrls).map(([key, url]) => (
                                                            <li key={key}>
                                                                <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center">
                                                                    {key}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => handleApprove(selectedApp.id)}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => handleReject(selectedApp.id)}
                                >
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedApp(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
