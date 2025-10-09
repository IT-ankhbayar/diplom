import EmptyState from '../components/EmptyState';
import ClientOnly from '../components/ClientOnly';

import getCurrentUser from '../actions/getCurrentUser';
import PropertiesClient from './PropertiesClient';
import getListings from '../actions/getListings';

const PropertiesPage = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Зөвшөөрөлгүй"
                    subtitle="Та нэвтэрнэ үү"
                />
            </ClientOnly>
        )
    }
    const listings = await getListings({
        userId: currentUser.id
    });

    if (listings.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Үл хөдлөх хөрөнгө олдсонгүй"
                    subtitle='Танд өмч байхгүй бололтой.'
                />
            </ClientOnly>
        )
    }

    return (
        <ClientOnly>
            <PropertiesClient
                listings={listings}
                currentUser={currentUser}
            />
        </ClientOnly>
    )

}

export default PropertiesPage;