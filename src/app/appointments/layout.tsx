import type { Metadata } from "next";
import { requirePageAuth, PatientShell } from "@/lib/require-page-auth";

export const metadata: Metadata = {
    title: "Appointments",
};

export default async function AppointmentsLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    await requirePageAuth();
    return <PatientShell>{children}</PatientShell>;
}
