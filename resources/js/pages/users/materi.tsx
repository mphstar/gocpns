import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Search } from 'lucide-react';
import { UserNav } from './user-nav';
import { useEffect, useState } from 'react';

type MateriItem = {
    id: number;
    name: string;
    file_url?: string | null;
};

type PageProps = {
    materi: {
        data: MateriItem[];
        next_page_url?: string | null;
        prev_page_url?: string | null;
        current_page: number;
        last_page: number;
    };
    search?: string;
};

const Materi = () => {
    const { materi, search } = usePage<PageProps>().props;
    const [keyword, setKeyword] = useState(search ?? '');

    useEffect(() => {
        setKeyword(search ?? '');
    }, [search]);

    const submitSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const payload: Record<string, string> = {};
        if (keyword.trim()) payload.search = keyword.trim();
        router.get(route('app.materi'), payload, { replace: true, preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 sm:pb-0">
            <Head title="Materi" />
            <UserNav />

            <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
                <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">
                        Materi Belajar
                    </Badge>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold">Rangkuman materi CPNS</h1>
                            <p className="text-muted-foreground">Pilih materi, baca ringkasan, lanjut latihan.</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/app/home">Kembali</Link>
                        </Button>
                    </div>
                </div>

                <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" onSubmit={submitSearch}>
                    <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                        <Search className="h-4 w-4" />
                        <Input
                            className="border-0 shadow-none"
                            placeholder="Cari materi..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="outline">
                        Cari
                    </Button>
                </form>

                <div className="grid gap-4 md:grid-cols-2">
                    {materi.data.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="flex-row items-center justify-between gap-3">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <span>Materi</span>
                                </div>
                                {item.file_url && (
                                    <Button size="sm" asChild>
                                        <a href={item.file_url} target="_blank" rel="noreferrer">
                                            Buka
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {materi.data.length === 0 && (
                        <Card className="md:col-span-2">
                            <CardContent className="py-6 text-sm text-muted-foreground">Materi belum tersedia.</CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Materi;
