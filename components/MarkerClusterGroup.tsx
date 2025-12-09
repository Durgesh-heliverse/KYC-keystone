'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { FirstResponder } from '@/types';
import { createCategoryIcon } from '@/lib/mapIcons';

interface MarkerClusterGroupProps {
  markers: FirstResponder[];
  onMarkerClick: (responder: FirstResponder) => void;
  distances?: Record<string, number>;
}

export default function MarkerClusterGroup({ markers, onMarkerClick, distances }: MarkerClusterGroupProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create marker cluster group
    const markerClusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 80, // Cluster radius in pixels
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster: any) {
        const count = cluster.getChildCount();
        let size = 'small';
        let iconSize = 40;
        if (count > 100) {
          size = 'large';
          iconSize = 60;
        } else if (count > 50) {
          size = 'medium';
          iconSize = 50;
        }

        return L.divIcon({
          html: `<div class="marker-cluster marker-cluster-${size}"><span>${count}</span></div>`,
          className: 'marker-cluster-container',
          iconSize: L.point(iconSize, iconSize),
        });
      },
    });

    // Add markers to cluster group
    markers.forEach((responder) => {
      const icon = createCategoryIcon(responder.category);
      const marker = L.marker([responder.locationLat, responder.locationLng], { icon });

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${responder.title}</h3>
          <div class="space-y-1 text-sm">
            <p class="text-gray-700">
              <span class="font-semibold">Category:</span> ${responder.category}
            </p>
            <p class="text-gray-700">
              <span class="font-semibold">City:</span> ${responder.city}
            </p>
            <p class="text-gray-700">
              <span class="font-semibold">State:</span> ${responder.state}
            </p>
            <p class="text-gray-700">
              <span class="font-semibold">Phone:</span> ${responder.phoneNumber}
            </p>
            ${distances && typeof distances[responder.id] === 'number' ? `
              <p class="text-blue-600">
                <span class="font-semibold">Distance:</span> ${distances[responder.id].toFixed(1)} km
              </p>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onMarkerClick(responder);
      });

      markerClusterGroup.addLayer(marker);
    });

    // Add cluster group to map
    map.addLayer(markerClusterGroup);

    // Cleanup
    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, markers, onMarkerClick, distances]);

  return null;
}

