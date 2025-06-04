'use client';

import { useCallback, useState } from 'react';
import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useRentModal from '@/app/hooks/useRentModal';
import { signOut } from 'next-auth/react';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import Avatar from '../Avatar';


interface UserMenuProps {
    currentUser?: SafeUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({
    currentUser
}) => {
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

        rentModal.onOpen();
    }, [currentUser, loginModal, rentModal]);

    const onProfile = useCallback(() => {
        router.push('/profile');
    }, [router]);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <div
                    onClick={onProfile}
                    title="Профайл руу очих"
                    className="p-1 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-400 transition group"
                    style={{ transition: 'box-shadow 0.2s, border-color 0.2s' }}
                >
                    {/* Larger Avatar icon for profile navigation with hover effect */}
                    <Avatar src={currentUser?.image} />
                </div>
            </div>
            {isOpen && (
                <div className='absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12
                text-sm
                    '>
                        <div className='flex flex-col cursor-pointer'> 
                            {currentUser ? (
                                <>
                                    <MenuItem
                                        onClick={() => router.push("/trips")}
                                        label='Миний аялал'
                                        />
                                        <MenuItem
                                        onClick={() => router.push("/favorites")}
                                        label="Таалагдсан"
                                        />
                                        <MenuItem
                                        onClick={() => router.push("/reservations")}
                                        label="Миний захиалга"
                                        />
                                        <MenuItem
                                        onClick={() => router.push("/properties")}
                                        label="Миний өмч"
                                        />
                                        <MenuItem
                                        onClick={rentModal.onOpen}
                                        label="Миний гэр"
                                        />
                                        <hr/>
                                        <MenuItem
                                        onClick={() => signOut()}
                                        label="Гарах"
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
                                            </svg>
                                        }
                                        />
                                    </> 
                            ) : (
                            <>
                                    <MenuItem
                                    onClick={loginModal.onOpen}
                                    label='Нэвтрэх'
                                    />
                                    <MenuItem
                                    onClick={registerModal.onOpen}
                                    label="Бүртгүүлэх"
                                    />
                                </> 
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;