"use client";

import useSearchModal from '@/app/hooks/useSearchModal';
import { BiSearch } from 'react-icons/bi';

const SearchIconButton = () => {
    const searchModal = useSearchModal();
    return (
        <button
            type="button"
            aria-label="Open search"
            onClick={searchModal.onOpen}
            className="md:hidden inline-flex items-center justify-center rounded-full border border-neutral-200 p-2 hover:shadow-md active:scale-95 transition text-neutral-600"
        >
            <BiSearch size={18} />
        </button>
    );
};

export default SearchIconButton;