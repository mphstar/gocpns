import { Head, Link, usePage } from '@inertiajs/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, MessageCircle, ShieldCheck, Sparkles, Target } from 'lucide-react';

const features = [
    {
        icon: Sparkles,
        title: 'Belajar Terarah',
        desc: 'Materi dipilih khusus untuk membantu kamu lulus seleksi CPNS dengan efektif.',
    },
    {
        icon: ShieldCheck,
        title: 'Mentor Siap Bantu',
        desc: 'Ada tim yang siap membimbing serta menjawab pertanyaan seputar belajar dan tryout.',
    },
    {
        icon: Target,
        title: 'Tryout Realistis',
        desc: 'Simulasi soal dan penilaian mendekati ujian sebenarnya supaya kamu lebih siap.',
    },
];

const faqs = [
    {
        question: 'Berapa lama masa berlaku paket yang saya beli?',
        answer:
            'Masa berlaku untuk paket CPNS adalah satu tahun dan paket BUMN enam bulan sejak tanggal pembelian. Selama aktif, semua fitur bisa dipakai.',
    },
    {
        question: 'Apakah saya bisa mengubah paket langganan?',
        answer: 'Bisa. Ubah paket kapan saja melalui pengaturan akun.',
    },
    {
        question: 'Bagaimana cara menghubungi layanan pelanggan?',
        answer: 'Hubungi kami via email support@gocpns.com atau lewat live chat di aplikasi.',
    },
    {
        question: 'Apakah data saya aman di GoCPNS?',
        answer: 'Kami menggunakan enkripsi dan praktik keamanan terkini untuk melindungi data kamu.',
    },
];

const Welcome = () => {
    const page = usePage<{ auth?: { user?: { role?: string } } }>();
    const isLoggedIn = !!page.props.auth?.user;
    const homeHref = isLoggedIn ? '/app/home' : '/login';
    const containerClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Beranda" />

            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
                <div className={`${containerClass} flex items-center justify-between py-4`}>
                    <div className="flex items-center gap-2">
                        <Badge className="rounded-full px-3 py-1">GoCPNS</Badge>
                        <span className="text-sm text-muted-foreground">Bantu kamu lulus seleksi</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <Button asChild>
                                <Link href={homeHref}>Ke Halaman Saya</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Masuk</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">Daftar</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className={`${containerClass} flex flex-col gap-14 py-12`}>
                <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
                            <MessageCircle className="h-4 w-4" />
                            <span>Temani belajar CPNS</span>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                                Bantu Kamu Lulus Seleksi <span className="text-primary">CPNS</span>
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Pemantapan materi, trik cepat, dan strategi belajar supaya kamu lebih siap menghadapi tes.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href="/register" className="flex items-center gap-2">
                                    Mulai Gratis
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/login">Saya sudah punya akun</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                            <div className="rounded-lg border bg-background/70 p-3">
                                <p className="text-2xl font-semibold text-foreground">10K+</p>
                                <p>Pengguna belajar</p>
                            </div>
                            <div className="rounded-lg border bg-background/70 p-3">
                                <p className="text-2xl font-semibold text-foreground">1.5K</p>
                                <p>Paket soal</p>
                            </div>
                            <div className="rounded-lg border bg-background/70 p-3">
                                <p className="text-2xl font-semibold text-foreground">98%</p>
                                <p>Pengguna puas</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 shadow-xl">
                        <div className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                            Fokus CPNS 2025
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="rounded-2xl bg-background/90 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Modul aktif</p>
                                        <p className="text-xl font-semibold">TWK, TIU, TKP</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Ringkasan materi, contoh soal, dan pembahasan singkat yang mudah dipahami.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-primary text-primary-foreground p-5 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90">Tryout minggu ini</p>
                                        <p className="text-3xl font-bold">Simulasi SKD</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20">
                                        <Target className="h-6 w-6" />
                                    </div>
                                </div>
                                <p className="mt-3 text-sm opacity-90">Rasakan suasana ujian asli dengan waktu dan penilaian serupa.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <Badge variant="outline" className="w-fit">Kenapa GoCPNS</Badge>
                        <h2 className="text-2xl font-semibold">Fitur yang bantu kamu fokus</h2>
                        <p className="text-muted-foreground">Disusun agar belajar lebih terarah, cepat, dan terukur.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="rounded-xl border bg-background/70 p-5 shadow-sm">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Badge variant="outline" className="w-fit">FAQ</Badge>
                        <h2 className="text-2xl font-semibold">Pertanyaan yang sering ditanyakan</h2>
                    </div>
                    <div className="space-y-2">
                        {faqs.map((item, index) => (
                            <Accordion key={item.question} type="single" collapsible>
                                <AccordionItem value={`item-${index}`}>
                                    <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                                    <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border bg-primary text-primary-foreground px-6 py-8 shadow-md">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm uppercase tracking-wide text-primary-foreground/80">Siap mulai?</p>
                            <h3 className="text-2xl font-semibold">Daftar sekarang, belajar langsung hari ini.</h3>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" asChild>
                                <Link href="/register">Daftar</Link>
                            </Button>
                            <Button variant="outline" className="bg-white text-primary" asChild>
                                <Link href="/login">Masuk</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Welcome;
