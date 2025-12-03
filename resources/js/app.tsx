import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from '@/components/ui/sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const AppWrapper = () => {
            const [isLoading, setIsLoading] = useState(false);
            const loadingTimeout = useRef<number | null>(null);

            const startLoading = () => {
                if (loadingTimeout.current) {
                    clearTimeout(loadingTimeout.current);
                }
                loadingTimeout.current = window.setTimeout(() => setIsLoading(true), 200);
            };

            const stopLoading = () => {
                if (loadingTimeout.current) {
                    clearTimeout(loadingTimeout.current);
                    loadingTimeout.current = null;
                }
                setIsLoading(false);
            };

            useEffect(() => {
                const start = router.on('start', startLoading);
                const finish = router.on('finish', stopLoading);
                const error = router.on('error', stopLoading);

                return () => {
                    start();
                    finish();
                    error();
                    stopLoading();
                };
            }, []);

            return (
                <>
                    <App {...props} />
                    <Toaster />
                    {isLoading && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
                            <div className="rounded-full border bg-background/90 px-4 py-2 shadow-lg">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    Memuat...
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        };

        root.render(<AppWrapper />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
