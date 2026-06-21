"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "../ui/card";
import { SidebarTrigger } from "../ui/sidebar";

const routeMap: Record<string, string> = {
    dashboard: "Dashboard",
    settings: "Settings",
    users: "User Management",
    "api-keys": "API Keys",
};

export function AdminBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split("/admin").pop()?.split("/").filter((segment) => segment !== "") || [];
    const formatLabel = (segment: string) => {
        if (routeMap[segment]) return routeMap[segment];
        return segment
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    return (
        <Card className="mb-4 rounded-3xl">
            <CardContent className="flex items-center gap-6">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard">Admin</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {segments.map((segment, index) => {
                            const href = `/dashboard/${segments.slice(0, index + 1).join("/")}`;
                            const isLast = index === segments.length - 1;

                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{formatLabel(segment)}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={href}>{formatLabel(segment)}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </CardContent>
        </Card>
    );
}
