'use client';

import { useRouter } from 'next/navigation';

import Container from '../components/Container';
import Heading from '../components/Heading';

import { SafeListing, SafeUser } from "../types";
import { useCallback, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ListingCard from '../components/listings/ListingCard';

interface PropertiesClientProps {
    listings: SafeListing[];
    currentUser?: SafeUser | null;
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
    listings,
    currentUser
}) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');

    const onCancel = useCallback((id: string) => {
        setDeletingId(id);

        axios.delete(`/api/listings/${id}`)
        .then(() => {
            toast.success('Цуцалсан');
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
                title="Үл хөдлөх хөрөнгө"
                subtitle="Таны өмч хөрөнгийн жагсаалт"
            />
            <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            xl:grid-cols-5 2xl:grid-cols-6'>
                {listings.map((listings) => (
                    <ListingCard
                        key={listings.id}
                        data={listings}
                        actionId={listings.id}
                        onAction={onCancel}
                        disabled={deletingId === listings.id}
                        actionLabel="Устгах"
                        currentUser={currentUser}
                    />
                ))}
            </div>
        </Container>
    );
}
 
export default PropertiesClient;