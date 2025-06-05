'use client';

interface MenuItemProps {
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
    onClick,
    label,
    icon
}) => {
    return ( 
        <div
            onClick={onClick}
            className="px-4 py-3 hover:bg-neutral-100 transition font-semibold flex items-center gap-2"
        >
            {icon && <span className="w-5 h-5 flex items-center">{icon}</span>}
            {label}
        </div>
    );
}
 
export default MenuItem;