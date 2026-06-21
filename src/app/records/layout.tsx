import type { Metadata } from "next";
import { requirePageAuth, PatientShell } from "@/lib/require-page-auth";

export const metadata: Metadata = {
    title: "Medical Records",
};

export default async function RecordsLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    await requirePageAuth();
    return <PatientShell>{children}</PatientShell>;
}
