import { requirePageAuth, PatientShell } from "@/lib/require-page-auth";

export default async function TelemedicineLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    await requirePageAuth();
    return <PatientShell>{children}</PatientShell>;
}
