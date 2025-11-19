import { Toaster } from '@/components/ui/toaster';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { toast } from '@/hooks/use-toast';
import { SharedData, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { pengaturan, flash } = usePage<SharedData & { flash?: { success?: string; error?: string } }>().props;

    const { favicon } = pengaturan;

    useEffect(() => {
        if (!favicon) return;

        const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = favicon.startsWith('/') ? favicon : `/${favicon}`;
        if (!favicon) return;
        fetch(link.href, { method: 'HEAD' })
            .then((response) => {
                if (response.ok) {
                    document.head.appendChild(link);
                }
            })
            .catch(() => {
                console.warn('Favicon file does not exist.');
            });

        document.head.appendChild(link);
    }, [favicon]);

    useEffect(() => {
        if (flash?.success) {
            toast({ title: 'Berhasil', description: flash.success });
        }
        if (flash?.error) {
            toast({ title: 'Terjadi Kesalahan', description: flash.error, variant: 'destructive' });
        }
    }, [flash?.success, flash?.error]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <Toaster />
            {children}
        </AppLayoutTemplate>
    );
};
