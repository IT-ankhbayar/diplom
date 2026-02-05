'use client';

import { useState } from 'react';
import CountrySelect, { CountrySelectValue } from './Inputs/CountrySelect';
import Map from './Map';


export default function LocationStep() {
    const [location, setLocation] =
        useState<CountrySelectValue | undefined>(undefined);

    return (
        <div className="space-y-4">

            <CountrySelect
                value={location}
                onChange={setLocation}
            />

            <Map country={location} />

        </div>
    );
}
