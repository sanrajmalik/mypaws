const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

// Types
export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    phone?: string;
    phoneVerified: boolean;
    address?: string;
    cityId?: number;
    pincode?: string;
    status: string;
    isBreeder: boolean;
    isAdmin: boolean;
    createdAt: string;
}

export interface PaymentHistoryItem {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    listingType?: string;
    pricingTier?: string;
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: User;
}

// API Client
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // ... existing fetch method ...

    private async fetch<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // ... implementation existing ...
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Include cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new ApiError(response.status, error.error || 'unknown_error', error.error_description || 'An error occurred');
        }

        if (response.status === 204) return {} as T;

        return response.json();
    }

    // Auth endpoints
    async mockLogin(email: string, name: string): Promise<AuthResponse> {
        return this.fetch('/v1/auth/mock', {
            method: 'POST',
            body: JSON.stringify({ email, name }),
        });
    }

    async googleLogin(idToken: string): Promise<AuthResponse> {
        return this.fetch('/v1/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        });
    }

    async refreshToken(refreshToken: string) {
        return this.fetch('/v1/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    }

    async logout(allDevices = false) {
        return this.fetch('/v1/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ allDevices }),
        });
    }

    async getCurrentUser(): Promise<User> {
        return this.fetch('/v1/auth/me');
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        return this.fetch('/v1/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteAccount(): Promise<void> {
        return this.fetch('/v1/auth/me', {
            method: 'DELETE',
        });
    }

    async getMyPayments(): Promise<PaymentHistoryItem[]> {
        return this.fetch('/v1/payments/me');
    }

    // Health check
    async health() {
        return this.fetch('/health');
    }

    // Admin
    async getAdminStats() {
        return this.fetch('/admin/breeders/stats');
    }

    async getPendingBreederApplications() {
        return this.fetch<any[]>('/admin/breeders/applications/pending');
    }

    async approveBreederApplication(id: string) {
        return this.fetch(`/admin/breeders/applications/${id}/approve`, {
            method: 'POST'
        });
    }

    async rejectBreederApplication(id: string, reason: string) {
        return this.fetch(`/admin/breeders/applications/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    // User Management
    async getUsers(params: { search?: string; type?: string; status?: string; page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.type) query.append('type', params.type);
        if (params.status) query.append('status', params.status);
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());

        return this.fetch(`/admin/users?${query.toString()}`);
    }

    async updateUserStatus(id: string, status: string) {
        return this.fetch(`/admin/users/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
    }
}

// Custom error class
export class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        public description: string
    ) {
        super(description);
        this.name = 'ApiError';
    }
}

// Export singleton instance
export const api = new ApiClient(API_URL);
