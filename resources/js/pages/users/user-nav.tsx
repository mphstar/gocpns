import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, LogOut, Target, History } from 'lucide-react';

const navLinks = [
    { href: '/app/home', label: 'Beranda', icon: Home },
    { href: '/app/materi', label: 'Materi', icon: BookOpen },
    { href: '/app/tryout', label: 'Tryout', icon: Target },
];
const mobileLinks = [...navLinks, { href: '/app/riwayat', label: 'Riwayat', icon: History }];

export const UserNav = () => (
    <>
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">GoCPNS</span>
                    <span className="text-sm text-muted-foreground hidden md:static">Belajar & tryout</span>
                </Link>
                <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} className="flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground transition hover:bg-muted">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/dashboard">Dashboard</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/logout" method="post" as="button" className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" /> Keluar
                        </Link>
                    </Button>
                </div>
            </div>
        </header>

        {/* Bottom nav untuk mobile */}
        <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 px-1 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
            <div className="flex items-center justify-around">
                {mobileLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted"
                    >
                        <Icon className="h-5 w-5" />
                        <span className="leading-none">{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    </>
);
