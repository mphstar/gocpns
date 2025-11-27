import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Folder,
    LayoutGrid,
    LucideAlignEndVertical,
    LucideBetweenVerticalStart,
    LucideBlocks,
    LucideLayoutTemplate,
    LucideUser,
    PackageSearch,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutGrid,
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Jenis Tryout',
        url: '/admin/jenis-tryout',
        icon: LucideLayoutTemplate,
    },
    {
        title: 'Kategori Soal',
        url: '/admin/kategori',
        icon: LucideAlignEndVertical,
    },
    {
        title: 'Materi',
        url: '/admin/materi',
        icon: LucideBlocks,
    },
    {
        title: 'Bank Soal',
        url: '/admin/bank-soal',
        icon: LucideBetweenVerticalStart,
    },
    {
        title: 'Pengguna',
        url: '/admin/user',
        icon: LucideUser,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain title={'Master Data'} items={masterNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
