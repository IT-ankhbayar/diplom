"use client";

import { useRouter, usePathname } from 'next/navigation';
import { FiHome } from 'react-icons/fi';

const HomeIconButton = () => {
    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === '/';

    if (isHome) return null;

    return (
        <button
            type="button"
            aria-label="Return home"
            onClick={() => router.push('/')}
            className="md:hidden inline-flex items-center justify-center rounded-full border border-neutral-200 p-2 hover:shadow-md active:scale-95 transition text-neutral-600"
        >
            <FiHome size={18} />
        </button>
    );
};

export default HomeIconButton;