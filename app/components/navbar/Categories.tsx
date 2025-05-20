'use client'

import Container from "../Container";

import { IoDiamond } from "react-icons/io5";
import { TbBeach, TbMountain, TbPool } from 'react-icons/tb';
import { GiBarn, GiBoatFishing, GiCactus, GiCastle, GiCaveEntrance, GiForestCamp, GiIsland, GiWindmill } from 'react-icons/gi';
import { MdOutlineVilla } from 'react-icons/md';
import CategoryBox from "../CategoryBox";
import { usePathname, useSearchParams } from "next/navigation";
import { FaCampground, FaSkiing } from "react-icons/fa";
import { BsSnow } from "react-icons/bs";

export const categories = [
    {
        label: 'Урц',
        icon: FaCampground,
        description: 'This property is luxurious!'
    },
    {
        label: 'Орон сууц',
        icon: MdOutlineVilla,
        description: 'Орчин үеийн!'
    },
    {
        label: 'Орон нутаг',
        icon: TbMountain,
        description: 'Орон нутагт байршилтай!'
    },

    {
        label: 'Зуслан',
        icon: GiForestCamp,
        description: 'Та кемпинг хийх боломжтой!'
    },
    
]

const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();

    const isMainPage = pathname === '/';

    if (!isMainPage) {
        return null;
    }
    return (  
        <Container>
            <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
                {categories.map((item) => (
                    <CategoryBox 
                        key={item.label}
                        label={item.label}
                        selected={category === item.label}
                        icon={item.icon}/>
                ))}
            </div>
        </Container>
    );
}
 
export default Categories;