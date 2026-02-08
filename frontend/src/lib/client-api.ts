import { getInternalApiUrl_Client } from './public-api';

const API_URL = getInternalApiUrl_Client();

interface RequestOptions {
    headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        details?: any;
    };
}

class ApiClient {
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private async request<T>(endpoint: string, method: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options?.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers,
                credentials: 'include', // Send httpOnly cookies
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!res.ok) {
                // Try to parse error response
                let errorData;
                try {
                    errorData = await res.json();
                } catch {
                    errorData = { message: res.statusText };
                }

                return {
                    error: {
                        message: errorData.message || `Request failed with status ${res.status}`,
                        details: errorData,
                    },
                };
            }

            // Handle 204 No Content
            if (res.status === 204) {
                return { data: {} as T };
            }

            const data = await res.json();
            return { data };
        } catch (err: any) {
            return {
                error: {
                    message: err.message || 'Network error',
                },
            };
        }
    }

    async get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, 'GET', undefined, options);
    }

    async post<T>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, 'POST', body, options);
    }

    async put<T>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, 'PUT', body, options);
    }

    async delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, 'DELETE', undefined, options);
    }
}

export const getClient = () => new ApiClient();
