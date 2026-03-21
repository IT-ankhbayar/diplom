'use client';

import useCartStore from "@/app/hooks/useCartStore";
import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);
    const removeByKey = useCartStore((s) => s.removeByKey);
    const grandTotal = useCartStore((s) => s.grandTotal);

    const total = useMemo(() => grandTotal(), [grandTotal]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <div className="mx-auto max-w-7xl px-4 py-10">

                {/* breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm">
                    <span className="text-rose-500 font-semibold">🛒 Миний сагс</span>
                    <span className="text-neutral-400">›</span>
                    <span className="text-neutral-500">Төлбөрийн мэдээлэл</span>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* LEFT - ITEMS */}
                    <div className="lg:col-span-2">
                        <h1 className="mb-6 text-3xl font-bold text-neutral-900">
                            Таны захиалга
                        </h1>

                        <div className="space-y-4">

                            {items.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-neutral-300 p-12 text-center">
                                    <div className="mb-2 text-4xl">📦</div>
                                    <p className="text-neutral-600 font-medium">Сагс хоосон байна</p>
                                    <p className="text-neutral-400 text-sm mt-1">Зочид нүүрэнд буцаж оронг сонгоорой</p>
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

                    {/* RIGHT - PAYMENT SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-lg border border-neutral-100">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                                    Төлбөрийн хураамж
                                </h2>
                                <p className="text-xs text-neutral-500">Төлбөрийн дэлгэрэнгүй</p>
                            </div>

                            <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">

                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600 text-sm">Захиалгын тоо</span>
                                    <span className="font-semibold text-neutral-900 bg-rose-50 px-3 py-1 rounded-full text-sm">
                                        {items.length}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end">
                                    <span className="text-neutral-600 text-sm">Нийт төлбөр</span>
                                    <span className="text-base font-bold text-neutral-900">
                                        {total.toLocaleString()}₮
                                    </span>
                                </div>

                            </div>

                            {/* Payment Fees Section */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                                <h3 className="text-sm font-semibold text-neutral-800">💳 Төлбөрийн хураамж</h3>



                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-600">Татвар (10%)</span>
                                    <span className="text-neutral-900 font-medium">
                                        {Math.round(total * 0.1).toLocaleString()}₮
                                    </span>
                                </div>


                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-700 font-semibold">Нийт төлөх</span>
                                    <span className="text-2xl font-bold text-rose-500">
                                        {(total + Math.round(total * 0.1)).toLocaleString()}₮
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={items.length === 0}
                                onClick={() => router.push("/checkout")}
                                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-bold text-white hover:from-rose-600 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                ✓ Үргэлжлүүлэх
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
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden flex-shrink-0">
                {item.image && (
                    <Image
                        src={item.image}
                        alt={item.title || "listing"}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                    />
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-bold text-neutral-900">
                        {item.title || `Захиалга (ID: ${item.id})`}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-3">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-neutral-500">📅</span>
                            <span className="text-xs text-neutral-600">
                                {start.toLocaleDateString('mn-MN')} – {end.toLocaleDateString('mn-MN')}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-neutral-500">🌙</span>
                            <span className="text-xs text-neutral-600">{nights} хоног</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-neutral-100">
                    <div className="flex gap-3 items-baseline">
                        <span className="text-sm text-neutral-500">
                            {item.price.toLocaleString()}₮
                        </span>
                        <span className="text-xs text-neutral-400">/ хоног</span>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="text-right">
                            <div className="text-lg font-bold text-rose-500">
                                {item.totalPrice.toLocaleString()}₮
                            </div>
                        </div>
                        <button
                            onClick={onRemove}
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                        >
                            🗑 Устгах
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
