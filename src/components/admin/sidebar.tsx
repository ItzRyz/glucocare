'use client';

import { useEffect, useState } from 'react';
import { useOrganization, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';

interface MenuItem {
    id: string;
    name: string;
    path: string;
    icon: string | null;
    parentId: string | null;
    children: MenuItem[];
}

const IconRenderer = ({ name }: { name: string | null }) => {
    if (!name) return <LucideIcons.SquareCode className="h-4 w-4" />;
    if (!(name in LucideIcons)) {
        return <LucideIcons.LayoutDashboard className="h-4 w-4" />;
    }
    const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
    return <IconComponent className="h-4 w-4" />;
};

export function AdminSidebar() {
    const { organization, isLoaded } = useOrganization();
    const pathname = usePathname();

    const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { open } = useSidebar();

    useEffect(() => {
        if (!isLoaded) return;
        if (!organization) {
            return;
        }

        let isMounted = true;

        async function fetchSidebarLayout() {
            try {
                setLoading(true);
                const res = await fetch('/api/admin/sidebar');
                const body = await res.json();

                if (body.success && isMounted) {
                    setMenuTree(body.data);
                }
            } catch (err) {
                console.error('Failed fetching dynamic layout:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchSidebarLayout();

        return () => {
            isMounted = false;
        };
    }, [organization, isLoaded]); // Safely track organization updates

    // 3. Render loading state safely
    if (!isLoaded || loading) {
        return (
            <Sidebar variant="floating" collapsible="icon" className='ms-6 my-auto max-h-[98vh]'>
                <SidebarContent className="flex items-center justify-center p-4">
                    <LucideIcons.Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-2">Loading workspace configurations...</span>
                </SidebarContent>
            </Sidebar>
        );
    }

    return (
        <Sidebar variant="floating" collapsible="icon" className='ms-6 my-auto max-h-[98vh]'>
            <SidebarHeader className="border-b px-4 py-3">
                <Link href="/admin" className="flex items-center space-x-2">
                    <LucideIcons.Activity className="h-6 w-6 text-primary" />
                    {open && (
                        <span className="hidden font-bold sm:inline-block">
                            GlucoCare Admin
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {menuTree.length > 0 ? (
                            menuTree.map((item) => {
                                const hasChildren = item.children && item.children.length > 0;

                                return (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.path}
                                            tooltip={item.name}
                                        >
                                            <Link href={item.path} className="flex items-center gap-2 w-full">
                                                <IconRenderer name={item.icon} />
                                                <span className="font-medium">{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>

                                        {hasChildren && (
                                            <SidebarMenuSub>
                                                {item.children.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.id}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === subItem.path}
                                                        >
                                                            <Link href={subItem.path} className="flex items-center gap-2">
                                                                <IconRenderer name={subItem.icon} />
                                                                <span>{subItem.name}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-center">
                                <p className="text-xs text-muted-foreground">No modules granted to your active group role.</p>
                            </div>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <UserButton showName={open ? true : false} />
            </SidebarFooter>
        </Sidebar>
    );
}