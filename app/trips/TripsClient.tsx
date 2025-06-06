'use client';

import { useRouter } from 'next/navigation';

import Container from '../components/Container';
import Heading from '../components/Heading';

import { SafeReservation, SafeUser } from "../types";
import { useCallback, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ListingCard from '../components/listings/ListingCard';

interface TripsClientProps {
    reservations: SafeReservation[];
    currentUser?: SafeUser | null;
}

const TripsClient: React.FC<TripsClientProps> = ({
    reservations,
    currentUser
}) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');

    const onCancel = useCallback((id: string) => {
        setDeletingId(id);

        axios.delete(`/api/reservations/${id}`)
        .then(() => {
            toast.success('Захиалгыг цуцалсан');
            router.refresh();
        })
        .catch((error) => {
            toast.error(error?.response?.data?.error);
        })
        .finally(() => {
            setDeletingId('');
        });
    }, [router]);
    return (  
        <Container>
            <Heading
                title="Trips"
                subtitle="Та хаашаа явж байна вэ"
            />
            <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
                {reservations.map((reservation, idx) => (
                    <div key={reservation.id}>
                        <ListingCard
                            data={reservation.listing}
                            reservation={reservation}
                            actionId={reservation.id}
                            onAction={onCancel}
                            disabled={deletingId === reservation.id}
                            actionLabel="Захиалгаа цуцлах"
                            currentUser={currentUser}
                        />
                        {idx < reservations.length - 1 && <div className="h-6" />}
                    </div>
                ))}
            </div>
        </Container>
    );
}
 
export default TripsClient;