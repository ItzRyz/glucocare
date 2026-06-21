import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminTemplate } from "@/components/admin/template";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = {
    title: 'Admin Dashboard',
};

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { userId, orgRole } = await auth();
    if (!userId) redirect("/sign-in");
    if (orgRole !== "org:admin") redirect("/dashboard");

    return (
        <SidebarProvider>
            <AdminSidebar />
            <AdminTemplate>
                {children}
            </AdminTemplate>
        </SidebarProvider>
    );
}
