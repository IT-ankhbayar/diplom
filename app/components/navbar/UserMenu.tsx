"use client";

import { AiOutlineMenu } from "react-icons/ai";
import Avatar from "../Avatar";
import { useCallback, useState } from "react";
import MenuItem from "./MenuItem";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useRentModal";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import { useRouter } from "next/navigation";
import { FiUser, FiLogIn, FiUserPlus } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
import { IoAdd } from "react-icons/io5";

interface UserMenuProps {
    currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
    const router = useRouter();
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const rentModal = useRentModal();

    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onRent = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        if (!currentUser.verified) {
            return router.push("/verify");
        }
        rentModal.onOpen();
    }, [currentUser, loginModal, rentModal, router]);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">

                {/* SMALLER MENU ICON */}
                <div
                    onClick={toggleOpen}
                    className="
            p-2 
            md:py-1 
            md:px-2 
            border border-neutral-200 
            flex flex-row 
            items-center 
            gap-2 
            rounded-full 
            cursor-pointer 
            hover:shadow-md 
            transition 
            text-neutral-600
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
            absolute 
            rounded-xl 
            shadow-md 
            w-[180px] 
            md:w-[220px] 
            bg-white 
            overflow-hidden 
            right-0 
            top-12 
            text-sm 
            border border-neutral-100
          "
                >
                    <div className="flex flex-col cursor-pointer">
                        {currentUser ? (
                            <>
                                <MenuItem
                                    onClick={onRent}
                                    label="Газар нэмэх"
                                    icon={<IoAdd size={18} />}
                                />

                                <MenuItem
                                    onClick={() => router.push("/profile")}
                                    label="Профайл"
                                    icon={<FiUser size={18} />}
                                />

                                <hr className="border-neutral-200" />

                                <MenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    label="Гарах"
                                    icon={<CiLogout size={18} />}
                                />
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    onClick={loginModal.onOpen}
                                    label="Нэвтрэх"
                                    icon={<FiLogIn size={18} />}
                                />
                                <MenuItem
                                    onClick={registerModal.onOpen}
                                    label="Бүртгүүлэх"
                                    icon={<FiUserPlus size={18} />}
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
