"use client";
import Container from "../Container";
import Categories from "./Categories";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from './UserMenu';
import SearchIconButton from './SearchIconButton';
import HomeIconButton from './HomeIconButton';
import { SafeUser } from '@/app/types';
interface NavbarProps { currentUser?: SafeUser | null; }
const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
    return (<div className="fixed w-full bg-white z-10 shadow-sm">
        <div className="border-b border-neutral-200"><Container>
            <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
                <div className="flex items-center gap-2 p-2">
                    <HomeIconButton />
                    <SearchIconButton />
                    <Logo />
                </div>
                <div className="hidden md:block">
                    <Search />
                </div>
                <UserMenu currentUser={currentUser} />
            </div>
        </Container></div>
        <Categories />
    </div>);
}
export default Navbar;