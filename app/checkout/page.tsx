'use client';

import useCartStore from "@/app/hooks/useCartStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PayTiming = "now" | "later";
type PaymentMethod = "CARD" | "QPAY" | "STOREPAY";

export default function CheckoutPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);
    const grandTotal = useCartStore((s) => s.grandTotal);
    const clear = useCartStore((s) => s.clear);

    const total = useMemo(() => grandTotal(), [grandTotal, items]);

    const [payTiming, setPayTiming] = useState<PayTiming>("now");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [activeSection, setActiveSection] = useState<1 | 2 | 3>(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sec1Ref = useRef<HTMLDivElement | null>(null);
    const sec2Ref = useRef<HTMLDivElement | null>(null);
    const sec3Ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const els = [
            { id: 1 as const, el: sec1Ref.current },
            { id: 2 as const, el: sec2Ref.current },
            { id: 3 as const, el: sec3Ref.current },
        ].filter((x) => x.el);

        if (els.length === 0) return;

        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

                const top = visible[0];
                if (!top) return;

                const found = els.find((x) => x.el === top.target);
                if (found) setActiveSection(found.id);
            },
            { threshold: [0.25, 0.4, 0.6] }
        );

        els.forEach((x) => io.observe(x.el!));

        return () => io.disconnect();
    }, []);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <div className="mx-auto max-w-xl px-4 py-12">
                    <div className="rounded-xl border bg-white p-6">
                        <div className="text-xl font-bold">Сагс хоосон байна</div>
                        <button
                            onClick={() => router.push("/")}
                            className="mt-4 rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
                        >
                            Нүүр рүү буцах
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const first = items[0];
    const start = new Date(first.startDate);
    const end = new Date(first.endDate);
    const nights = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const handleNext = () => setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    paymentMethod,
                    payTiming,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.log("Checkout failed:", res.status, data);
                throw new Error(data?.error || `Checkout failed (${res.status})`);
            }

            clear();
            router.push("/reservations");
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Checkout алдаа");
        } finally {
            setLoading(false);
        }
    };

    const MethodCard = ({
        value,
        title,
        subtitle,
        badge,
    }: {
        value: PaymentMethod;
        title: string;
        subtitle: string;
        badge?: string;
    }) => {
        const active = paymentMethod === value;
        return (
            <button
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={[
                    "w-full rounded-xl border p-4 text-left transition",
                    active ? "border-neutral-900 ring-1 ring-neutral-900" : "hover:bg-neutral-50",
                ].join(" ")}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-semibold text-neutral-900">{title}</div>
                            {badge && (
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                    {badge}
                                </span>
                            )}
                        </div>
                        <div className="mt-1 text-sm text-neutral-500">{subtitle}</div>
                    </div>

                    <div className="mt-1 h-4 w-4 rounded-full border grid place-items-center">
                        {active && <div className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                    </div>
                </div>
            </button>
        );
    };

    const sectionClass = (id: 1 | 2 | 3) =>
        [
            "rounded-2xl border bg-white p-5 transition",
            activeSection === id ? "border-neutral-900 ring-1 ring-neutral-900" : "",
        ].join(" ");

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* header */}
                <div className="mb-6 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-neutral-50"
                        aria-label="Back"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold">Confirm and pay</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* LEFT */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* STEP 1 */}
                        <div ref={sec1Ref} className={sectionClass(1)}>
                            <div className="flex justify-between">
                                <div className="font-bold">1. Choose when to pay</div>
                                {step > 1 && (
                                    <button onClick={() => setStep(1)} className="text-sm underline">
                                        Edit
                                    </button>
                                )}
                            </div>

                            {step === 1 && (
                                <div className="mt-4 space-y-3">
                                    <label className="flex justify-between border rounded-xl p-4 hover:bg-neutral-50">
                                        <div>
                                            <div className="font-semibold">
                                                Pay {total.toLocaleString()}₮ now
                                            </div>

                                        </div>
                                        <input
                                            type="radio"
                                            checked={payTiming === "now"}
                                            onChange={() => setPayTiming("now")}
                                        />
                                    </label>

                                    <button
                                        onClick={handleNext}
                                        className="ml-auto block rounded-lg bg-black text-white px-5 py-2"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* STEP 2 */}
                        <div ref={sec2Ref} className={sectionClass(2)}>
                            <div className="flex justify-between">
                                <div className="font-bold">2. Payment method</div>
                                {step > 2 && (
                                    <button onClick={() => setStep(2)} className="text-sm underline">
                                        Edit
                                    </button>
                                )}
                            </div>

                            {step === 2 && (
                                <>
                                    <div className="mt-3 grid gap-3">
                                        <MethodCard
                                            value="CARD"
                                            title="Card"
                                            subtitle="Visa / MasterCard"
                                            badge="Popular"
                                        />
                                        <MethodCard value="QPAY" title="QPay" subtitle="QR төлбөр" />
                                        <MethodCard
                                            value="STOREPAY"
                                            title="StorePay"
                                            subtitle="Хуваан төлөх"
                                        />
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="mt-4 ml-auto block rounded-lg bg-black text-white px-5 py-2"
                                    >
                                        Next
                                    </button>
                                </>
                            )}

                            {step !== 2 && (
                                <div className="mt-2 text-sm text-neutral-500">
                                    Сонгосон: <b>{paymentMethod}</b>
                                </div>
                            )}
                        </div>

                        {/* STEP 3 */}
                        <div ref={sec3Ref} className={sectionClass(3)}>
                            <div className="font-bold">3. Review & Confirm</div>

                            {step === 3 && (
                                <>
                                    <div className="mt-2 text-sm">
                                        Items: {items.length} <br />
                                        Nights: {nights} <br />
                                        Method: <b>{paymentMethod}</b> <br />
                                        Total: <b>{total.toLocaleString()}₮</b>
                                    </div>

                                    {error && (
                                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        disabled={loading || payTiming !== "now"}
                                        onClick={handleConfirm}
                                        className="mt-4 w-full rounded-lg bg-rose-500 text-white py-3 font-bold hover:bg-rose-600 disabled:opacity-50"
                                    >
                                        {loading ? "Processing..." : "Confirm & Pay (Demo)"}
                                    </button>


                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-6 rounded-2xl border bg-white p-5">
                            <div className="font-bold">Summary</div>
                            {/*  */}

                            <div className="mt-3 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span>Dates</span>
                                    <span>
                                        {start.toLocaleDateString()} – {end.toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Nights</span>
                                    <span>{nights}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Method</span>
                                    <span className="font-semibold">{paymentMethod}</span>
                                </div>

                                <div className="h-px bg-neutral-200 my-2" />

                                <div className="flex justify-between font-bold pt-1">
                                    <span>Total</span>
                                    <span>{total.toLocaleString()}₮</span>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
