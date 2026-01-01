'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Mock data, as we don't have a real college API
const MOCK_COLLEGES = [
  { lat: 0.02, lng: 0.01, name: 'University of Innovation' },
  { lat: -0.02, lng: -0.03, name: 'Creative Arts College' },
  { lat: 0.01, lng: -0.02, name: 'Institute of Technology' },
];

export default function CollegeLocator() {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          toast({
            title: 'Location Access Denied',
            description: "Showing a default location. Allow location access for better results.",
          });
          setCenter({ lat: 37.7749, lng: -122.4194 }); // Default to SF
        }
      );
    } else {
        toast({
            title: 'Geolocation Not Supported',
            description: "Your browser doesn't support geolocation. Showing default location.",
        });
        setCenter({ lat: 37.7749, lng: -122.4194 }); // Default to SF
    }
  }, [toast]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return (
        <div className="flex items-center justify-center h-full bg-destructive/10 text-destructive rounded-md p-4">
            Google Maps API Key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
        </div>
      )
  }

  if (!center) {
    return <Skeleton className="h-full w-full" />;
  }

  const collegeMarkers = MOCK_COLLEGES.map(college => ({
      ...college,
      lat: center.lat + college.lat,
      lng: center.lng + college.lng,
  }))

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border grow">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Map
                center={center}
                zoom={11}
                mapId="career-compass-map"
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
                {collegeMarkers.map(college => (
                    <Marker key={college.name} position={college} />
                ))}
            </Map>
        </APIProvider>
    </div>
  );
}
