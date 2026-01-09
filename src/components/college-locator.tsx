'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import dynamic from 'next/dynamic';

// Dynamic import of MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./map-view'), {
  loading: () => <Skeleton className="h-full w-full" />,
  ssr: false
});

interface College {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  stream: string;
}

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
          console.error("Error getting user location: ", error);
          // Fallback to Hyd, India for demo relevance or SF
          const fallbackLat = 17.3850;
          const fallbackLng = 78.4867;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng });
          generateMockColleges(fallbackLat, fallbackLng);
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
