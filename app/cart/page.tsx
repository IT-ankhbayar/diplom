'use client';

import useCartStore from "@/app/hooks/useCartStore";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);
    const removeByKey = useCartStore((s) => s.removeByKey);
    const grandTotal = useCartStore((s) => s.grandTotal);

    const total = useMemo(() => grandTotal(), [grandTotal, items]);

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-8">

                {/* breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
                    <span className="text-sky-500">Миний сагс</span>
                    <span>›</span>
                    <span>Захиалгын мэдээлэл</span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* LEFT */}
                    <div className="lg:col-span-8">
                        <h1 className="mb-4 text-2xl font-bold text-neutral-800">
                            Таны сагс
                        </h1>

                        <div className="rounded-xl border bg-white">
                            <div className="p-4 space-y-4">

                                {items.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-6 text-neutral-500">
                                        Сагс хоосон байна.
                                    </div>
                                ) : (
                                    items.map((it) => {
                                        const key = `${it.id}-${it.startDate}-${it.endDate}`;

                                        return (
                                            <CartItemRow
                                                key={key}
                                                item={it}
                                                onRemove={() => removeByKey(key)}
                                            />
                                        );
                                    })
                                )}

                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 rounded-xl border bg-white p-4">
                            <div className="mb-3 text-lg font-bold text-neutral-800">
                                Төлбөрийн мэдээлэл
                            </div>

                            <div className="space-y-2 text-sm">

                                <div className="flex justify-between text-neutral-600">
                                    <span>Захиалгын тоо</span>
                                    <span>{items.length}</span>
                                </div>

                                <div className="flex justify-between text-neutral-600">
                                    <span>Нийт</span>
                                    <span>{total.toLocaleString()}₮</span>
                                </div>

                                <div className="h-px bg-neutral-200 my-2" />

                                <div className="flex justify-between font-bold text-neutral-800">
                                    <span>Нийт төлөх</span>
                                    <span>{total.toLocaleString()}₮</span>
                                </div>
                            </div>

                            <button
                                disabled={items.length === 0}
                                onClick={() => router.push("/checkout")}
                                className="mt-4 w-full rounded-lg bg-rose-500 py-3 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-50"
                            >
                                Үргэлжлүүлэх
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

type RowProps = {
    item: {
        id: string;
        price: number;
        startDate: string;
        endDate: string;
        totalPrice: number;
        title?: string;
        image?: string;
    };
    onRemove: () => void;
};

function CartItemRow({ item, onRemove }: RowProps) {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    return (
        <div className="flex gap-4 rounded-xl border p-4">
            <div className="h-16 w-16 rounded-lg bg-neutral-100 overflow-hidden">
                {item.image && (
                    <img
                        src={item.image}
                        alt={item.title || "listing"}
                        className="h-full w-full object-cover"
                    />
                )}
            </div>

            <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-800">
                    {item.title || `Захиалга (ID: ${item.id})`}
                </div>

                <div className="mt-1 text-xs text-neutral-500">
                    {start.toLocaleDateString()} – {end.toLocaleDateString()}
                </div>

                <div className="mt-2 flex justify-between">
                    <div className="text-sm text-neutral-600">
                        {item.price.toLocaleString()}₮ / хоног
                    </div>
                    <div className="text-sm font-bold text-rose-500">
                        {item.totalPrice.toLocaleString()}₮
                    </div>
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={onRemove}
                        className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50"
                    >
                        Устгах
                    </button>
                </div>
            </div>
        </div>
    );
}
