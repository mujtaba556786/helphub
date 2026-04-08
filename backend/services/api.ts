
import { MOCK_USERS, MOCK_SERVICES, MOCK_BOOKINGS, MOCK_STATS, MOCK_REVIEWS } from './mockData';
import { User, Service, Review, Booking, UserStatus, UserRole } from '../types';

// Direct absolute URL to backend to avoid proxy and CORS issues
const BASE_URL = 'http://localhost:3000/api';

// Shared secret for the backend admin panel — must match ADMIN_PANEL_TOKEN in server.js
const ADMIN_TOKEN = 'helphub-admin-panel';

function capitalizeFirst(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

export const apiService = {
    async login(email: string, password: string): Promise<User | null> {
        if (email === 'admin@servicelink.com' && password === 'admin123') {
            return MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
        }
        const mockMatch = MOCK_USERS.find(u => u.email === email);
        if (mockMatch) return mockMatch;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${BASE_URL}/auth/passwordless`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return data.user;
            }
        } catch (e) {
            console.warn("Backend unreachable, continuing with mock.");
        }
        return null;
    },

    async createUser(userData: Partial<User>): Promise<User | null> {
        try {
            const res = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Mock creation");
        }
        return {
            id: 'U' + Date.now(),
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || UserRole.CUSTOMER,
            status: userData.status || UserStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            provider: 'Email',
            onboarded: true
        };
    },

    async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
        try {
            const res = await fetch(`${BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return res.ok;
        } catch {
            return true;
        }
    },

    async completeOnboarding(id: string, name: string, role: string, bio?: string) {
        try {
            const res = await fetch(`${BASE_URL}/users/${id}/onboard`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role, bio })
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Backend unreachable.");
        }
        return { success: true, status: role === 'Provider' ? 'Pending Approval' : 'Active' };
    },

    async approveUser(id: string) {
        try {
            await fetch(`${BASE_URL}/users/${id}/approve`, { method: 'PUT' });
            return true;
        } catch { return true; }
    },

    async updateUserStatus(id: string, status: UserStatus) {
        try {
            await fetch(`${BASE_URL}/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return true;
        } catch { return true; }
    },

    async moderateReview(id: string, status: 'Approved' | 'Rejected') {
        try {
            const action = status === 'Approved' ? 'approve' : 'reject';
            const res = await fetch(`${BASE_URL}/admin/reviews/${id}/${action}`, {
                method: 'PUT',
                headers: { 'x-admin-token': ADMIN_TOKEN }
            });
            return res.ok;
        } catch {
            return true;
        }
    },

    async deleteReview(id: string): Promise<boolean> {
        try {
            const res = await fetch(`${BASE_URL}/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-token': ADMIN_TOKEN }
            });
            return res.ok;
        } catch {
            return true;
        }
    },

    async updateProfile(id: string, data: { name: string, bio: string, avatar: string }) {
        try {
            await fetch(`${BASE_URL}/users/${id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return true;
        } catch { return true; }
    },

    async createService(service: Service) {
        try {
            await fetch(`${BASE_URL}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(service)
            });
            return true;
        } catch { return true; }
    },

    async getUsers(): Promise<User[]> {
        try {
            const res = await fetch(`${BASE_URL}/users`);
            if (res.ok) return await res.json();
        } catch { }
        return MOCK_USERS;
    },

    async getStats() {
        try {
            const res = await fetch(`${BASE_URL}/stats`);
            if (res.ok) return await res.json();
        } catch { }
        return MOCK_STATS;
    },

    async getServices(): Promise<Service[]> {
        try {
            const res = await fetch(`${BASE_URL}/services`);
            if (res.ok) return await res.json();
        } catch { }
        return MOCK_SERVICES;
    },

    async getBookings(): Promise<Booking[]> {
        try {
            const res = await fetch(`${BASE_URL}/bookings`);
            if (res.ok) return await res.json();
        } catch { }
        return MOCK_BOOKINGS;
    },

    async getReviews(): Promise<Review[]> {
        try {
            const res = await fetch(`${BASE_URL}/admin/reviews?status=all`, {
                headers: { 'x-admin-token': ADMIN_TOKEN }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.reviews)) {
                    return data.reviews.map((r: any) => ({
                        id: String(r.id),
                        customerName: r.reviewer_name || 'Anonymous',
                        providerId: r.provider_id ? String(r.provider_id) : undefined,
                        rating: r.stars || 0,
                        comment: r.comment || '',
                        serviceName: r.provider_name || 'Unknown',
                        status: capitalizeFirst(r.status) as Review['status'],
                        date: new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        })
                    }));
                }
            }
        } catch { }
        return MOCK_REVIEWS;
    }
};
