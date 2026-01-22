import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Location } from '../types/emergency';

interface LocationMapProps {
  location: Location | null;
  userName: string;
  isActive: boolean;
}

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function createMarkerElement(isActive: boolean): HTMLDivElement {
  const markerEl = document.createElement('div');
  markerEl.className = 'user-marker relative';

  // Create pulsing ring for active alerts
  if (isActive) {
    const pulseRing = document.createElement('div');
    pulseRing.className = 'absolute inset-0 bg-error rounded-full animate-ping opacity-75';
    pulseRing.style.cssText = 'width: 48px; height: 48px; margin: -8px;';
    markerEl.appendChild(pulseRing);
  }

  // Create main marker circle
  const markerCircle = document.createElement('div');
  markerCircle.className = 'w-8 h-8 bg-error rounded-full flex items-center justify-center border-4 border-white shadow-lg';

  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-4 h-4 text-white');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('viewBox', '0 0 20 20');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill-rule', 'evenodd');
  path.setAttribute('d', 'M10 18a8 8 0 100-16 8 8 0 000 16zm0-7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm0-6a1 1 0 011 1v3a1 1 0 11-2 0V6a1 1 0 011-1z');
  path.setAttribute('clip-rule', 'evenodd');

  svg.appendChild(path);
  markerCircle.appendChild(svg);
  markerEl.appendChild(markerCircle);

  return markerEl;
}

export function LocationMap({ location, userName, isActive }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Store initial location in a ref to avoid re-initializing map when location updates
  const initialLocationRef = useRef(location);

  // Initialize map (only runs once on mount)
  useEffect(() => {
    if (!mapContainer.current) return;

    const initialLoc = initialLocationRef.current;
    const initialCenter: [number, number] = initialLoc
      ? [initialLoc.longitude, initialLoc.latitude]
      : [106.8456, -6.2088]; // Default to Jakarta

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: 15,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add attribution
    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!map.current || !location) return;

    const markerEl = createMarkerElement(isActive);

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center',
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);

    // Fly to new location
    map.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 15,
      duration: 1000,
    });
  }, [location, isActive]);

  const handleOpenInMaps = () => {
    if (!location) return;

    const { latitude, longitude } = location;

    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // Try Apple Maps first
      window.open(`maps://maps.apple.com/?daddr=${latitude},${longitude}`, '_blank');
    } else {
      // Use Google Maps for Android and desktop
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        '_blank'
      );
    }
  };

  if (!location) {
    return (
      <div className="bg-secondary-background rounded-xl p-4 h-64 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Location not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-secondary-background rounded-xl overflow-hidden">
        <div ref={mapContainer} className="h-64 w-full" />
      </div>

      <button
        onClick={handleOpenInMaps}
        className="btn-primary w-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Navigate to {userName}
      </button>

      {location.accuracy && location.accuracy > 50 && (
        <p className="text-xs text-gray-500 text-center">
          Location accuracy: ~{Math.round(location.accuracy)}m
        </p>
      )}
    </div>
  );
}
