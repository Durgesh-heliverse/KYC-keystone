'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { FirstResponder } from '@/types';
import { createCategoryIcon, createSmallCategoryIcon } from '@/lib/mapIcons';

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
      maxClusterRadius: 60, // Cluster radius in pixels
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster: any) {
        const count = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();
        
        // Get the most common category in the cluster
        const categoryCounts: Record<string, number> = {};
        markers.forEach((marker: any) => {
          const category = marker.category || 'Police';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        const dominantCategory = Object.keys(categoryCounts).reduce((a, b) => 
          categoryCounts[a] > categoryCounts[b] ? a : b
        ) as any;

        // Create small icon for the cluster
        const icon = createSmallCategoryIcon(dominantCategory);
        
        // Extract icon URL from the icon object
        const iconUrl = (icon as any).options.iconUrl;
        const iconSize = count > 50 ? 28 : count > 20 ? 26 : 24;
        
        return L.divIcon({
          html: `
            <div style="position: relative; display: inline-block; width: ${iconSize}px; height: ${iconSize}px;">
              <img src="${iconUrl}" style="width: ${iconSize}px; height: ${iconSize}px; display: block;" />
              ${count > 1 ? `<div style="position: absolute; bottom: -6px; right: -6px; background: #dc2626; color: white; border-radius: 50%; width: 19px; height: 19px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid white; line-height: 1;">${count > 99 ? '99+' : count}</div>` : ''}
            </div>
          `,
          className: 'marker-cluster-container',
          iconSize: L.point(iconSize + 10, iconSize + 10),
        });
      },
    });

    // Add markers to cluster group
    markers.forEach((responder) => {
      const icon = createSmallCategoryIcon(responder.category);
      const marker = L.marker([responder.locationLat, responder.locationLng], { 
        icon
      });
      // Store category on marker object for cluster icon determination
      (marker as any).category = responder.category;

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

