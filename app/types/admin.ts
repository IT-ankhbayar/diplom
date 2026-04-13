export interface AdminUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    verificationImage?: string | null;
    verified?: boolean | null;
}

export interface AdminListing {
    id: string;
    title?: string | null;
    category?: string | null;
    price?: number | null;
    userId?: string | null;
}

export interface AdminReservation {
    id: string;
    userId?: string | null;
    listing?: { title?: string | null } | null;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    totalPrice?: number | null;
}