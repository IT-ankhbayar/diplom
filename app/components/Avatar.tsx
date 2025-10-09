'use client' ;

import Image from "next/image";

interface AvatarProps {
    src: string | null | undefined;
}

const Avatar: React.FC<AvatarProps> = ({
    src
}) => {
    const validSrc = src && src.trim() !== '' ? src : "/images/placeholder.png";
    return (
        <Image className="rounded-full" 
        height="30" 
        width="30" 
        alt="Avatar" 
        src={validSrc}
        />
    );
}

export default Avatar;