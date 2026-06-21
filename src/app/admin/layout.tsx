import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminTemplate } from "@/components/admin/template";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = {
    title: 'Admin Dashboard',
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <AdminTemplate>
                {children}
            </AdminTemplate>
        </SidebarProvider>
    );
}
