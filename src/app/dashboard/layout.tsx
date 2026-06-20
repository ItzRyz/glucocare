import type { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
export const metadata: Metadata = {
    title: "Dashboard"
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
        </>
    );
}
