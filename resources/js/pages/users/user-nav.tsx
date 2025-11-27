import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, LogOut, Target } from 'lucide-react';

const navLinks = [
    { href: '/app/home', label: 'Beranda', icon: Home },
    { href: '/app/materi', label: 'Materi', icon: BookOpen },
    { href: '/app/tryout', label: 'Tryout', icon: Target },
];

export const UserNav = () => (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">GoCPNS</span>
                <span className="text-sm text-muted-foreground">Belajar & tryout</span>
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
);
