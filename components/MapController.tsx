'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  center: [number, number] | null;
  zoom: number | null;
}

export default function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom !== null) {
      map.setView(center, zoom, {
        animate: true,
        duration: 0.5,
      });
    } else if (center && zoom === null) {
      // If center is set but zoom is null, use default zoom (15) for location clicks
      map.setView(center, 15, {
        animate: true,
        duration: 0.5,
      });
    } else if (zoom !== null && !center) {
      // If only zoom is set (for reset), update zoom only
      map.setZoom(zoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [center, zoom, map]);

  return null;
}

