"use client";

import React from "react";
import { ImSpinner2 } from "react-icons/im";

interface MenuItemProps {
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
    onClick,
    label,
    icon,
    disabled,
    loading,
}) => {
    return (
        <div
            onClick={() => {
                if (disabled || loading) return;
                onClick();
            }}
            className={`
        px-4 py-3 hover:bg-neutral-100 transition flex items-center justify-between
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
        >
            <div className="flex items-center gap-3">
                <span className="text-neutral-700">{icon}</span>
                <span>{label}</span>
            </div>

            {loading && <ImSpinner2 className="animate-spin" size={16} />}
        </div>
    );
};

export default MenuItem;
