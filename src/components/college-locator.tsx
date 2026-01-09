'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import dynamic from 'next/dynamic';

// Dynamic import of MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./map-view'), {
  loading: () => <Skeleton className="h-full w-full" />,
  ssr: false
});

<<<<<<< HEAD
const Map = ({ center }: { center: { lat: number, lng: number } | null }) => {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    if (center && process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY) {
      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      const markers = MOCK_COLLEGES.map(college => `lonlat:${center.lng + college.lng},${center.lat + college.lat};color:%23ff0000;size:medium`).join('|');
      const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${center.lng},${center.lat}&zoom=14&marker=${markers}&apiKey=${apiKey}`;
      setMapUrl(mapUrl);
    }
  }, [center]);

  if (!process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 text-destructive rounded-md p-4">
        Geoapify API Key is not configured. Please add NEXT_PUBLIC_GEOAPIFY_API_KEY to your environment variables.
      </div>
    )
  }

  if (!center) {
    return <Skeleton className="h-full w-full" />;
  }

  return mapUrl ? <img src={mapUrl} alt="Map of colleges" className="w-full h-full object-cover rounded-md" /> : <Skeleton className="h-full w-full" />;
};
=======
interface College {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  stream: string;
}
>>>>>>> d4e3f69bc80057d8d1a3fd533acdfbcc2cfcc108

export default function CollegeLocator() {
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          generateMockColleges(latitude, longitude);
        },
        (error) => {
<<<<<<< HEAD
          console.warn("Location access denied or failed, using default location.", error.message);
          // Fallback to a default location if user denies permission
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
=======
          console.error("Error getting user location: ", error);
          // Fallback to Hyd, India for demo relevance or SF
          const fallbackLat = 17.3850;
          const fallbackLng = 78.4867;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng });
          generateMockColleges(fallbackLat, fallbackLng);
>>>>>>> d4e3f69bc80057d8d1a3fd533acdfbcc2cfcc108
        }
      );
    } else {
      const fallbackLat = 17.3850;
      const fallbackLng = 78.4867;
      setUserLocation({ lat: fallbackLat, lng: fallbackLng });
      generateMockColleges(fallbackLat, fallbackLng);
    }
  }, []);

  const generateMockColleges = (lat: number, lng: number) => {
    const streamTypes = ['Science', 'Commerce', 'Arts', 'Vocational'];
    const mockColleges: College[] = [];

    for (let i = 0; i < 8; i++) {
      // Random offset within ~3-5km
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;

      mockColleges.push({
        id: i,
        name: `Junior College ${i + 1} - ${['Excellence', 'Public', 'Model', 'International'][i % 4]}`,
        lat: lat + latOffset,
        lng: lng + lngOffset,
        rating: 3.5 + Math.random() * 1.5,
        stream: streamTypes[i % streamTypes.length]
      });
    }
    setColleges(mockColleges);
  };

  if (!userLocation) {
    return <Skeleton className="h-96 w-full rounded-md" />;
  }

  return (
    <div className="w-full h-96 rounded-md overflow-hidden relative z-0 border">
      <MapView center={userLocation} colleges={colleges} />
    </div>
  );
}
