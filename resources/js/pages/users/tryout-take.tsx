import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserNav } from './user-nav';
import { useEffect, useMemo, useState } from 'react';
import { Radio, Timer as TimerIcon } from 'lucide-react';

interface AnswerOption {
    id: number;
    opsi: string;
    teks: string;
    gambar?: string | null;
}

interface Question {
    id: number;
    nomor: number;
    soal: string;
    kategori?: string | null;
    gambar_soal?: string | null;
    jawaban: AnswerOption[];
}

interface TryoutProps {
    tryout: {
        id: number;
        judul: string;
        jenis?: string | null;
        durasi?: number | null;
        kategori: string[];
    };
    questions: Question[];
    session: {
        id: number;
        remaining_seconds: number;
        answers: Record<number, number>;
        started_at?: string | null;
    };
}

const TryoutTake = ({ tryout, questions, session }: TryoutProps) => {
    const [answers, setAnswers] = useState<Record<number, number | null>>(() => session.answers ?? {});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);
    const [confirmFinish, setConfirmFinish] = useState(false);

    const initialSeconds = useMemo(() => Math.max(0, session.remaining_seconds ?? 0), [session.remaining_seconds]);
    const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);

    useEffect(() => {
        setTimeLeft(initialSeconds);
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [initialSeconds]);

    useEffect(() => {
        if (timeLeft === 0) {
            finishTryout();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const handleSelect = (questionId: number, answerId: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
        router.post(
            route('app.tryout.answer', session.id),
            { question_id: questionId, jawaban_id: answerId },
            { preserveScroll: true, preserveState: true },
        );
    };

    const finishTryout = () => {
        router.post(route('app.tryout.finish', session.id), {}, { preserveScroll: true });
    };

    const currentQuestion = questions[currentIndex];
    const minutes = Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, '0');
    const seconds = Math.floor(timeLeft % 60)
        .toString()
        .padStart(2, '0');
    const allAnswered = questions.every((q) => !!answers[q.id]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 sm:pb-0">
            <Head title={`Tryout - ${tryout.judul}`} />
            <UserNav />

            <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">{tryout.jenis ?? 'Tryout'}</p>
                        <h1 className="text-2xl font-semibold">{tryout.judul}</h1>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {tryout.kategori.map((kat) => (
                                <Badge key={kat} variant="outline">
                                    {kat}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">Durasi: {tryout.durasi ?? '-'} menit</p>
                        {session.started_at && (
                            <p className="text-xs text-muted-foreground">Dimulai: {session.started_at}</p>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                        <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold">
                            <TimerIcon className="h-4 w-4 text-primary" />
                            <span className={timeLeft < 60 ? 'text-destructive' : ''}>
                                {minutes}:{seconds}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/app/tryout">Kembali</Link>
                            </Button>
                            <Button
                                disabled={timeLeft <= 0}
                                variant={timeLeft > 0 ? 'default' : 'outline'}
                                onClick={() => setConfirmFinish(true)}
                            >
                                Selesaikan Tryout
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[3fr_1fr]">
                    {currentQuestion && (
                        <Card key={currentQuestion.id} className="border-muted">
                            <CardHeader className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="secondary">Soal #{currentQuestion.nomor}</Badge>
                                    {currentQuestion.kategori && <Badge variant="outline">{currentQuestion.kategori}</Badge>}
                                </div>
                                <CardTitle className="text-base font-semibold leading-relaxed">{currentQuestion.soal}</CardTitle>
                                {currentQuestion.gambar_soal && (
                                    <img
                                        src={currentQuestion.gambar_soal}
                                        alt={`Gambar soal ${currentQuestion.nomor}`}
                                        className="mt-2 max-h-60 w-full rounded-lg object-contain cursor-pointer"
                                        onClick={() =>
                                            setPreview({
                                                src: currentQuestion.gambar_soal ?? '',
                                                alt: `Gambar soal ${currentQuestion.nomor}`,
                                            })
                                        }
                                    />
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {currentQuestion.jawaban.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:border-primary"
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${currentQuestion.id}`}
                                            value={opt.id}
                                            checked={answers[currentQuestion.id] === opt.id}
                                            onChange={() => handleSelect(currentQuestion.id, opt.id)}
                                            className="mt-1 h-4 w-4"
                                        />
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Radio className="h-4 w-4 text-primary" />
                                                <span className="font-semibold">{opt.opsi}</span>
                                            </div>
                                            <p className="text-muted-foreground whitespace-pre-line">{opt.teks}</p>
                                            {opt.gambar && (
                                                <img
                                                    src={opt.gambar}
                                                    alt={`Gambar jawaban ${opt.opsi}`}
                                                    className="max-h-32 w-full rounded-md object-contain cursor-pointer"
                                                    onClick={() =>
                                                        setPreview({
                                                            src: opt.gambar ?? '',
                                                            alt: `Gambar jawaban ${opt.opsi}`,
                                                        })
                                                    }
                                                />
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="h-fit border-muted">
                        <CardHeader>
                            <CardTitle className="text-sm">Navigasi Soal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-2">
                                {questions.map((q, idx) => {
                                    const answered = !!answers[q.id];
                                    const active = idx === currentIndex;
                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition ${
                                                active
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : answered
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-muted-foreground/20 hover:border-primary text-muted-foreground'
                                            }`}
                                        >
                                            {q.nomor}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                    >
                        Sebelumnya
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Soal {currentIndex + 1} dari {questions.length}
                    </div>
                    <Button
                        variant="outline"
                        disabled={currentIndex === questions.length - 1}
                        onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </main>

            {preview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreview(null)}
                    role="presentation"
                >
                    <div className="relative max-h-[90vh] max-w-5xl">
                        <Button
                            size="sm"
                            className="absolute right-2 top-2 bg-black/70 text-white hover:bg-black"
                            onClick={() => setPreview(null)}
                        >
                            Tutup
                        </Button>
                        <img
                            src={preview.src}
                            alt={preview.alt}
                            className="max-h-[80vh] max-w-5xl rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {confirmFinish && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setConfirmFinish(false)}
                    role="presentation"
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-background p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-2">Selesaikan tryout?</h3>
                        <p className="text-sm text-muted-foreground mb-4">Jawaban yang sudah tersimpan akan dihitung.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setConfirmFinish(false)}>
                                Batal
                            </Button>
                            <Button onClick={finishTryout}>Selesaikan</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TryoutTake;
