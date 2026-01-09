'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { School, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default markers not showing in some bundlers
// We rely on custom icons so standard marker imports might be skippable if not used
// But if we used them:
// import L from 'leaflet';
// delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom Icons using Lucide
// Custom Icons using Lucide
const createCustomIcon = (icon: React.ReactNode, bgColor: string) => {
    const html = renderToStaticMarkup(
        <div className="relative flex flex-col items-center justify-center transform -translate-y-full">
            <div style={{ backgroundColor: bgColor }} className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10">
                <div className="text-white">
                    {icon}
                </div>
            </div>
            <div style={{ borderTopColor: bgColor }} className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-[1px] z-0 drop-shadow-sm opacity-90"></div>
            <div className="w-3 h-1 bg-black/20 rounded-full blur-[1px] absolute -bottom-[2px]"></div>
        </div>
    );

    return new DivIcon({
        html: html,
        className: 'bg-transparent',
        iconSize: [32, 42],
        iconAnchor: [16, 42], // Tip at bottom
        popupAnchor: [0, -42]
    });
};

const userIcon = createCustomIcon(<MapPin size={16} />, '#3b82f6'); // Blue-500
const collegeIcon = createCustomIcon(<School size={16} />, '#ef4444'); // Red-500

// Recenter map when position changes
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, 13); // Zoom level 13 is good for city view
    return null;
}

interface MapViewProps {
    center: { lat: number, lng: number };
    colleges: Array<{ id: number, name: string, lat: number, lng: number, rating: number, stream: string }>;
}

export default function MapView({ center, colleges }: MapViewProps) {
    return (
        <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-md z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={[center.lat, center.lng]} />

            {/* User Marker */}
            <Marker position={[center.lat, center.lng]} icon={userIcon}>
                <Popup>You are here</Popup>
            </Marker>

            {/* College Markers */}
            {colleges.map((college) => (
                <Marker key={college.id} position={[college.lat, college.lng]} icon={collegeIcon}>
                    <Popup>
                        <div className="font-sans min-w-[150px]">
                            <h3 className="font-bold text-base mb-1">{college.name}</h3>
                            <div className="text-sm border-t pt-1 mt-1">
                                <p>Stream: <span className="font-medium">{college.stream}</span></p>
                                <p className="text-yellow-600 flex items-center gap-1">
                                    ★ {college.rating.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
