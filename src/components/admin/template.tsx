import { ReactNode } from "react";
import { AdminBreadcrumb } from "./breadcrumb";

export function AdminTemplate({ children }: { children: ReactNode }) {
    return (
        <main className="flex justify-center w-full">
            <div className="w-full px-12 py-4">
                <AdminBreadcrumb />
                {children}
            </div>
        </main>
    )
}