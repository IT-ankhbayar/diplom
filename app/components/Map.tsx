'use client';
import { MNG } from '@/app/data/mongolia-admin';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from '../leaflet/marker-icon-2x.png';
import markerIcon from '../leaflet/marker-icon.png';
import markerShadow from '../leaflet/marker-shadow.png';


import type { CountrySelectValue } from './Inputs/CountrySelect';

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 0.8 });
    }, [center, zoom, map]);
    return null;
}

async function geocode(query: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        query
    )}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (!data?.length) return null;
    return {
        lat: Number(data[0].lat),
        lon: Number(data[0].lon),
        display: data[0].display_name as string,
    };
}



function isMongolia(opt?: CountrySelectValue) {
    if (!opt) return false;

    const value = String(opt.value ?? '').toUpperCase().trim();
    const label = String(opt.label ?? '').toLowerCase().trim();

    return value === 'MN' || label.includes('mongolia');
}

type Props = {
    country?: CountrySelectValue;
    center?: [number, number];
};

export default function Map({ country, center: initialCenter }: Props) {
    const isMNG = isMongolia(country);

    const [aimag, setAimag] = useState('');
    const [duureg, setDuureg] = useState('');
    const [khoroo, setKhoroo] = useState('');

    const [center, setCenter] = useState<[number, number] | null>(initialCenter ?? null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!isMNG) {
            setAimag('');
            setDuureg('');
            setKhoroo('');
        }
    }, [isMNG]);

    const duuregList = useMemo(() => {
        return MNG.find((a) => a.aimag === aimag)?.duuregs ?? [];
    }, [aimag]);

    const khorooList = useMemo(() => {
        return duuregList.find((d) => d.name === duureg)?.khoroos ?? [];
    }, [duureg, duuregList]);

    async function handleLocate() {
        setMsg('');

        if (isMNG) {
            if (!aimag) {
                setMsg('Аймаг сонгоорой');
                return;
            }

            let lat = 47.9, lng = 106.9;
            let display = aimag;

            const selectedAimag = MNG.find((a) => a.aimag === aimag);
            if (selectedAimag) {
                lat = selectedAimag.lat ?? lat;
                lng = selectedAimag.lng ?? lng;

                if (duureg) {
                    const selectedDuureg = selectedAimag.duuregs.find((d) => d.name === duureg);
                    if (selectedDuureg) {
                        lat = selectedDuureg.lat ?? lat;
                        lng = selectedDuureg.lng ?? lng;
                        display = `${duureg}, ${aimag}`;

                        if (khoroo) {
                            const selectedKhoroo = selectedDuureg.khoroos.find((k) => {
                                const kname = typeof k === 'string' ? k : k.name;
                                return kname === khoroo;
                            });
                            if (selectedKhoroo && typeof selectedKhoroo === 'object') {
                                lat = selectedKhoroo.lat ?? lat;
                                lng = selectedKhoroo.lng ?? lng;
                                display = `${khoroo}, ${duureg}, ${aimag}`;
                            }
                        }
                    }
                }
            }

            console.log('📍 Using coords:', { aimag, duureg, khoroo, lat, lng });
            setCenter([lat, lng]);
            setMsg(display);
            return;
        }

        const query = country?.label || country?.value || '';
        if (!query) {
            setMsg('Эхлээд улсаа сонгоорой.');
            return;
        }

        setLoading(true);
        try {
            const res = await geocode(query);
            if (!res) setMsg('Байршил олдсонгүй.');
            else {
                setCenter([res.lat, res.lon]);
                setMsg(res.display);
            }
        } catch {
            setMsg('Geocode алдаа гарлаа.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">

                {isMNG && (
                    <>
                        <select
                            className="border rounded px-3 py-2"
                            value={aimag}
                            onChange={(e) => {
                                setAimag(e.target.value);
                                setDuureg('');
                                setKhoroo('');
                            }}
                        >
                            <option value="">Аймаг/Хот</option>
                            {MNG.map((a) => (
                                <option key={a.aimag} value={a.aimag}>
                                    {a.aimag}
                                </option>
                            ))}
                        </select>

                        <select
                            className="border rounded px-3 py-2"
                            value={duureg}
                            disabled={!aimag}
                            onChange={(e) => {
                                setDuureg(e.target.value);
                                setKhoroo('');
                            }}
                        >
                            <option value="">Дүүрэг/Сум</option>
                            {duuregList.map((d) => (
                                <option key={d.name} value={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="border rounded px-3 py-2"
                            value={khoroo}
                            disabled={!duureg}
                            onChange={(e) => setKhoroo(e.target.value)}
                        >
                            <option value="">Хороо/Баг</option>
                            {khorooList.map((k) => (
                                <option key={k.name} value={k.name}>
                                    {k.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                <button className="border rounded px-3 py-2" onClick={handleLocate} disabled={loading}>
                    {loading ? 'Хайж байна...' : 'Map дээр очих'}
                </button>
            </div>

            {msg && <div className="text-sm opacity-80">{msg}</div>}

            <MapContainer
                center={(center ?? [20, 0]) as L.LatLngExpression}
                zoom={center ? 12 : 2}
                scrollWheelZoom={false}
                className="h-[35vh] rounded-lg"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {center && (
                    <>
                        <FlyTo center={center} zoom={12} />
                        <Marker position={center as unknown as L.LatLngExpression} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}
