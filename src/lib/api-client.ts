import type {
    ApiErrorBody,
    ApiSuccess,
    AdminMenu,
    AdminRole,
    AdminStats,
    AdminUser,
    Appointment,
    Category,
    ChatMessage,
    ChatRoom,
    DiagnosisPrediction,
    Doctor,
    GlucoseEvaluation,
    GlucoseRecord,
    MedicalRecord,
    MenuAccessRecord,
    TimeSlots,
    TypeRecord,
    WeeklyAssessment,
} from '@/types/api';

export class ApiClientError extends Error {
    code: string;
    status: number;

    constructor(message: string, code: string, status: number) {
        super(message);
        this.name = 'ApiClientError';
        this.code = code;
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    const body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;

    if (!body.success) {
        throw new ApiClientError(body.error.message, body.error.code, res.status);
    }

    return body.data;
}

export const api = {
    glucose: {
        list: (userId?: string) =>
            request<GlucoseRecord[]>(userId ? `/api/glucose?userId=${userId}` : '/api/glucose'),
        evaluate: (data: { level: number; testType: 'fasting' | 'post-meal' }) =>
            request<GlucoseEvaluation>('/api/glucose/evaluate', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        create: (data: {
            level: number;
            typeId: string;
            categoryId: string;
            notes?: string;
        }) =>
            request<GlucoseRecord>('/api/glucose', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },

    assessments: {
        list: (userId?: string) =>
            request<WeeklyAssessment[]>(
                userId ? `/api/assessments?userId=${userId}` : '/api/assessments'
            ),
        create: (data: { exercise: boolean; diet: boolean; symptoms?: string }) =>
            request<WeeklyAssessment>('/api/assessments', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },

    doctors: {
        list: () => request<Doctor[]>('/api/doctors'),
    },

    appointments: {
        list: (params?: { doctorId?: string; date?: string }) => {
            const qs = new URLSearchParams();
            if (params?.doctorId) qs.set('doctorId', params.doctorId);
            if (params?.date) qs.set('date', params.date);
            const query = qs.toString();
            return request<Appointment[]>(`/api/appointments${query ? `?${query}` : ''}`);
        },
        create: (data: { doctorId: string; date: string; timeSlot: string; notes?: string }) =>
            request<Appointment>('/api/appointments', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        cancel: (id: string) =>
            request<Appointment>(`/api/appointments/${id}`, { method: 'DELETE' }),
        slots: (doctorId: string, date: string) =>
            request<TimeSlots>(
                `/api/appointments/slots?doctorId=${doctorId}&date=${date}`
            ),
    },

    diagnose: {
        list: (userId?: string) =>
            request<DiagnosisPrediction[]>(
                userId ? `/api/diagnose?userId=${userId}` : '/api/diagnose'
            ),
        predict: (data: Record<string, unknown> & { model?: string; save?: boolean }) =>
            request<{ prediction: string; probability: string; model: string; id: string | null }>(
                '/api/diagnose',
                { method: 'POST', body: JSON.stringify(data) }
            ),
    },

    categories: {
        list: () => request<Category[]>('/api/categories'),
    },

    types: {
        list: (module?: string) =>
            request<TypeRecord[]>(module ? `/api/types?module=${module}` : '/api/types'),
    },

    chat: {
        rooms: () => request<ChatRoom[]>('/api/chat/rooms'),
        messages: (roomId: string) =>
            request<ChatMessage[]>(`/api/chat/messages?roomId=${roomId}`),
        send: (data: { roomId: string; content: string }) =>
            request<ChatMessage>('/api/chat/messages', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },

    medicalRecords: {
        list: (patientId?: string) =>
            request<MedicalRecord[]>(
                patientId
                    ? `/api/medical-records?patientId=${patientId}`
                    : '/api/medical-records'
            ),
    },

    admin: {
        stats: () => request<AdminStats>('/api/admin/stats'),
        users: {
            list: () => request<AdminUser[]>('/api/users'),
            create: (data: {
                email: string;
                password: string;
                username?: string;
                firstName?: string;
                lastName?: string;
                roleSlug: string;
            }) =>
                request<AdminUser>('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(data),
                }),
            update: (
                id: string,
                data: {
                    email?: string;
                    username?: string;
                    password?: string;
                    firstName?: string;
                    lastName?: string;
                    roleSlug?: string;
                }
            ) =>
                request<AdminUser>(`/api/users/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                }),
            remove: (id: string) =>
                request<null>(`/api/users/${id}`, { method: 'DELETE' }),
        },
        roles: {
            list: () => request<AdminRole[]>('/api/roles'),
            create: (data: { name: string; clerkRoleSlug: string; description?: string }) =>
                request<AdminRole>('/api/roles', {
                    method: 'POST',
                    body: JSON.stringify(data),
                }),
            update: (
                id: string,
                data: { name: string; clerkRoleSlug: string; description?: string }
            ) =>
                request<AdminRole>(`/api/roles/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                }),
            remove: (id: string) =>
                request<AdminRole>(`/api/roles/${id}`, { method: 'DELETE' }),
        },
        menus: {
            list: () => request<AdminMenu[]>('/api/menus'),
            create: (data: {
                name: string;
                path: string;
                icon?: string;
                parentId?: string | null;
            }) =>
                request<AdminMenu>('/api/menus', {
                    method: 'POST',
                    body: JSON.stringify(data),
                }),
            update: (
                id: string,
                data: {
                    name?: string;
                    path?: string;
                    icon?: string | null;
                    parentId?: string | null;
                }
            ) =>
                request<AdminMenu>(`/api/menus/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                }),
            remove: (id: string) =>
                request<null>(`/api/menus/${id}`, { method: 'DELETE' }),
            get: (id: string) => request<AdminMenu>(`/api/menus/${id}`),
        },
        menuAccess: {
            list: (roleId?: string) =>
                request<MenuAccessRecord[]>(
                    roleId ? `/api/menu-access?roleId=${roleId}` : '/api/menu-access'
                ),
            save: (data: {
                roleId: string;
                menuId: string;
                canCreate?: boolean;
                canRead?: boolean;
                canUpdate?: boolean;
                canDelete?: boolean;
            }) =>
                request<MenuAccessRecord>('/api/menu-access', {
                    method: 'POST',
                    body: JSON.stringify(data),
                }),
            remove: (id: string) =>
                request<null>(`/api/menu-access/${id}`, { method: 'DELETE' }),
        },
    },
};
