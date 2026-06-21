export type ApiSuccess<T> = {
    success: true;
    message: string;
    data: T;
    meta: { timestamp: string; [key: string]: unknown };
};

export type ApiErrorBody = {
    success: false;
    error: { code: string; message: string; details: unknown };
    meta: { timestamp: string };
};

export type GlucoseStatus = 'Normal' | 'Prediabetes' | 'Diabetes';

export type GlucoseRecord = {
    id: string;
    userId: string;
    level: number;
    notes: string | null;
    typeId: string;
    categoryId: string;
    createdAt: string;
    type: { id: string; name: string; module: string };
    category: { id: string; name: string; slug: string };
    user?: { id: string; name: string; email: string };
};

export type GlucoseEvaluation = {
    level: number;
    testType: string;
    status: GlucoseStatus;
    message: string;
};

export type WeeklyAssessment = {
    id: string;
    userId: string;
    exercise: boolean;
    diet: boolean;
    symptoms: string | null;
    createdAt: string;
    user?: { id: string; name: string; email: string };
};

export type Doctor = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: { name: string };
};

export type Appointment = {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    notes: string | null;
    statusId: string;
    status: { id: string; name: string; module: string };
    patient: { id: string; name: string; email: string; avatarUrl: string | null };
    doctor: { id: string; name: string; email: string; avatarUrl: string | null };
};

export type TimeSlots = {
    all: string[];
    available: string[];
    booked: string[];
};

export type DiagnosisPrediction = {
    id: string;
    userId: string;
    model: string;
    features: Record<string, unknown>;
    prediction: string;
    probability: string;
    createdAt: string;
    user?: { id: string; name: string; email: string };
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
};

export type TypeRecord = {
    id: string;
    name: string;
    module: string;
    description: string | null;
};

export type ChatRoom = {
    id: string;
    patientId: string;
    doctorId: string;
    statusId: string;
    status: { id: string; name: string };
    patient: { id: string; name: string; email: string; avatarUrl: string | null };
    doctor: { id: string; name: string; email: string; avatarUrl: string | null };
    updatedAt: string;
};

export type ChatMessage = {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: { id: string; name: string; email: string; avatarUrl: string | null };
    type: { id: string; name: string };
};

export type MedicalRecord = {
    id: string;
    patientId: string;
    doctorId: string;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
    createdAt: string;
    status: { id: string; name: string };
    patient: { id: string; name: string; email: string };
    doctor: { id: string; name: string; email: string };
    diagnoses: { id: string; code: string; name: string; notes: string | null }[];
    vitalSign: {
        bloodPressure: string | null;
        heartRate: number | null;
        weight: number | null;
        height: number | null;
        bmi: number | null;
    } | null;
};

export type AdminUser = {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    roleId: string;
    createdAt: string;
    role: { id: string; name: string; clerkRoleSlug: string };
};

export type AdminRole = {
    id: string;
    name: string;
    clerkRoleSlug: string;
    description: string | null;
    _count: { users: number; menuAccess: number };
    menuAccess: {
        id: string;
        menuId: string;
        canCreate: boolean;
        canRead: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        menu: { id: string; name: string; path: string };
    }[];
};

export type AdminMenu = {
    id: string;
    name: string;
    path: string;
    icon: string | null;
    parentId: string | null;
    children: AdminMenu[];
    roles?: {
        id: string;
        roleId: string;
        canCreate: boolean;
        canRead: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        role: { id: string; name: string; clerkRoleSlug: string };
    }[];
};

export type MenuAccessRecord = {
    id: string;
    roleId: string;
    menuId: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    role: { id: string; name: string; clerkRoleSlug: string };
    menu: { id: string; name: string; path: string };
};

export type AdminStats = {
    userCount: number;
    roleCount: number;
    menuCount: number;
    appointmentCount: number;
    glucoseCount: number;
    predictionCount: number;
    appointmentsByStatus: { status: string; count: number }[];
    mlService: { status: string; service?: string };
};
