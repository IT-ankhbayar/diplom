'use client'

import Container from "../Container";
import { TbMountain } from 'react-icons/tb';
import { GiForestCamp } from 'react-icons/gi';
import { MdOutlineVilla } from 'react-icons/md';
import CategoryBox from "../CategoryBox";
import { usePathname, useSearchParams } from "next/navigation";
import { FaCampground } from "react-icons/fa";


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