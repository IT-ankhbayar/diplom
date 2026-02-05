"use client";

import { AiOutlineMenu } from "react-icons/ai";
import {
    FiShoppingCart,
    FiUser,
    FiLogIn,
    FiUserPlus,
    FiHeart,
    FiBriefcase,
} from "react-icons/fi";
import Avatar from "../Avatar";
import { useCallback, useMemo, useState } from "react";
import MenuItem from "./MenuItem";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useRentModal";
import useCartStore from "@/app/hooks/useCartStore";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import { useRouter, usePathname } from "next/navigation";
import { CiLogout } from "react-icons/ci";
import { IoAdd } from "react-icons/io5";

interface UserMenuProps {
    currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
    const router = useRouter();
    const pathname = usePathname();

    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const rentModal = useRentModal();

    const items = useCartStore((state) => state.items);
    const cartCount = items.length;

    const [isOpen, setIsOpen] = useState(false);

    // ✅ route loading state
    const [navLoadingKey, setNavLoadingKey] = useState<string | null>(null);

    // ✅ Route өөрчлөгдөх үед loading-оо унтраана
    // pathname өөрчлөгдвөл шинэ хуудас руу орсон гэсэн үг
    useMemo(() => {
        setNavLoadingKey(null);
    }, [pathname]);

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onRent = useCallback(() => {
        if (!currentUser) return loginModal.onOpen();
        if (!currentUser.verified) return router.push("/verify");
        rentModal.onOpen();
    }, [currentUser, loginModal, rentModal, router]);

    // ✅ helper: loading асаагаад push хийнэ
    const go = useCallback(
        (key: string, href: string) => {
            setNavLoadingKey(key);
            setIsOpen(false); // хүсвэл dropdown-оо хааж болно
            router.push(href);
        },
        [router]
    );

    const isLoading = (key: string) => navLoadingKey === key;

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                {/* CART ICON + BADGE */}
                <button
                    onClick={() => go("cart", "/cart")}
                    className="
            relative p-2 border border-neutral-200 rounded-full
            hover:shadow-md transition text-neutral-600 hover:bg-neutral-100
          "
                >
                    <FiShoppingCart size={18} />

                    {cartCount > 0 && (
                        <span
                            className="
                absolute -top-1 -right-1 bg-red-500 text-white
                text-[10px] min-w-[16px] h-[16px] px-1
                flex items-center justify-center rounded-full font-semibold leading-none
              "
                        >
                            {cartCount > 9 ? "9+" : cartCount}
                        </span>
                    )}
                </button>

                {/* MENU + AVATAR */}
                <div
                    onClick={toggleOpen}
                    className="
            p-2 md:py-1 md:px-2 border border-neutral-200
            flex flex-row items-center gap-2 rounded-full cursor-pointer
            hover:shadow-md transition text-neutral-600
          "
                >
                    <AiOutlineMenu size={14} />
                    <div className="hidden md:block">
                        <Avatar src={currentUser?.image} />
                    </div>
                </div>
            </div>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <div
                    className="
            absolute rounded-xl shadow-md w-[180px] md:w-[220px]
            bg-white overflow-hidden right-0 top-12 text-sm
            border border-neutral-100
          "
                >
                    <div className="flex flex-col">
                        {currentUser ? (
                            <>
                                <MenuItem
                                    onClick={onRent}
                                    label="Газар нэмэх"
                                    icon={<IoAdd size={18} />}
                                    disabled={!!navLoadingKey}
                                />

                                <MenuItem
                                    onClick={() => go("profile", "/profile")}
                                    label="Профайл"
                                    icon={<FiUser size={18} />}
                                    loading={isLoading("profile")}
                                    disabled={!!navLoadingKey && !isLoading("profile")}
                                />

                                <MenuItem
                                    onClick={() => go("favorites", "/favorites")}
                                    label="Таалагдсан"
                                    icon={<FiHeart size={18} />}
                                    loading={isLoading("favorites")}
                                    disabled={!!navLoadingKey && !isLoading("favorites")}
                                />

                                <MenuItem
                                    onClick={() => go("reservations", "/reservations")}
                                    label="Аялалууд"
                                    icon={<FiBriefcase size={18} />}
                                    loading={isLoading("reservations")}
                                    disabled={!!navLoadingKey && !isLoading("reservations")}
                                />

                                <hr className="border-neutral-200" />

                                <MenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    label="Гарах"
                                    icon={<CiLogout size={18} />}
                                    disabled={!!navLoadingKey}
                                />
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    onClick={loginModal.onOpen}
                                    label="Нэвтрэх"
                                    icon={<FiLogIn size={18} />}
                                    disabled={!!navLoadingKey}
                                />

                                <MenuItem
                                    onClick={registerModal.onOpen}
                                    label="Бүртгүүлэх"
                                    icon={<FiUserPlus size={18} />}
                                    disabled={!!navLoadingKey}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
