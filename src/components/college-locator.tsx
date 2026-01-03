'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

// Mock data for colleges - in a real app, this would come from an API
const MOCK_COLLEGES = [
  { name: 'Harvard University', lat: 0.02, lng: -0.02 },
  { name: 'Stanford University', lat: -0.015, lng: 0.025 },
  { name: 'MIT', lat: 0.01, lng: 0.01 },
  { name: 'UC Berkeley', lat: -0.01, lng: -0.025 },
];

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

export default function CollegeLocator() {
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location: ", error);
          // Fallback to a default location if user denies permission
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      // Fallback for browsers that don't support geolocation
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  return (
    <div className="w-full h-96 rounded-md overflow-hidden">
      <Map center={userLocation} />
    </div>
  );
}
