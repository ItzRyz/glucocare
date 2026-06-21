import type { Metadata } from "next";
import { requirePageAuth, PatientShell } from "@/lib/require-page-auth";

export const metadata: Metadata = {
    title: "Dashboard"
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await requirePageAuth();
    return <PatientShell>{children}</PatientShell>;
}
