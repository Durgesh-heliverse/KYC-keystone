import { Icon } from 'leaflet';
import { Category } from '@/types';

export const createCategoryIcon = (category: Category): Icon => {
  const getIconColor = (cat: Category): string => {
    switch (cat) {
      case 'Police':
        return '#1e40af'; // Blue
      case 'Fire':
        return '#dc2626'; // Red
      case 'Ambulance':
        return '#16a34a'; // Green
      case 'Hospital':
        return '#ea580c'; // Orange
      case 'Emergency':
        return '#7c3aed'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };

  const getIconPath = (cat: Category): string => {
    switch (cat) {
      case 'Police':
        return 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
      case 'Fire':
        return 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
      case 'Ambulance':
        return 'M19 8h-1V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2v-2h1c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-5 6H9v-2h5v2zm4-4H9V8h9v2z';
      case 'Hospital':
        return 'M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6h10v2H4zm0 4h10v2H4zm0 4h7v2H4z';
      case 'Emergency':
        return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
      default:
        return 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z';
    }
  };

  const color = getIconColor(category);
  const path = getIconPath(category);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5">
      <path d="${path}"/>
    </svg>
  `;

  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svg),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

