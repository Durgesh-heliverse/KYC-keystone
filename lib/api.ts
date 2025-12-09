import { FirstResponder, Category } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_KYCURL || '';

export interface LocationResponse {
  id: string;
  title: string;
  category: string;
  city: string;
  state: string;
  address: string;
  locationLat: number;
  locationLng: number;
  phoneNumber: string;
  websiteUrl?: string;
  googleLocationUrl: string;
  distance?: number;
}

// Convert backend response to FirstResponder format
const mapLocationToResponder = (loc: any): FirstResponder => {
  // Handle category mapping (backend returns uppercase like "POLICE")
  const category = (loc.category || '').toUpperCase();
  let mappedCategory: Category = 'Police';
  
  if (category === 'POLICE') mappedCategory = 'Police';
  else if (category === 'FIRE') mappedCategory = 'Fire';
  else if (category === 'HOSPITAL') mappedCategory = 'Hospital';
  else if (category === 'AMBULANCE') mappedCategory = 'Ambulance';
  else if (category === 'EMERGENCY') mappedCategory = 'Emergency';
  
  // Handle nested city and state objects
  const cityName = loc.city?.name || loc.city || '';
  const stateName = loc.city?.state?.name || loc.state?.name || loc.state || '';
  
  return {
    id: loc.id?.toString() || '',
    title: loc.title || '',
    category: mappedCategory,
    city: cityName,
    state: stateName,
    address: loc.address || '',
    locationLat: Number(loc.latitude || loc.locationLat || 0),
    locationLng: Number(loc.longitude || loc.locationLng || 0),
    phoneNumber: loc.phone || loc.phoneNumber || '',
    websiteUrl: loc.website || loc.websiteUrl,
    googleLocationUrl: loc.googleLocationURL || loc.googleLocationUrl || loc.googleLocation || '',
  };
};

// Normalize API response that can be either an array of locations
// or an object containing { locations: [...], searchCenter, ... }
const normalizeLocationsResponse = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.locations)) return data.locations;
  return [];
};

// Get all locations with optional filters
export async function getAllLocations(params?: {
  category?: string;
  address?: string;
  cityId?: number;
  cityName?: string;
}): Promise<FirstResponder[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category.toUpperCase());
    if (params?.address) queryParams.append('address', params.address);
    if (params?.cityId) queryParams.append('cityId', params.cityId.toString());
    if (params?.cityName) queryParams.append('cityName', params.cityName);

    const response = await fetch(`${API_BASE}/locations?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch locations');
    const data: LocationResponse[] = await response.json();
    return data.map(mapLocationToResponder);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

// Get closest locations to a point
export async function getClosestLocations(
  latitude: number,
  longitude: number,
  params?: {
    limit?: number;
    category?: string;
  }
): Promise<FirstResponder[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category.toUpperCase());

    const response = await fetch(`${API_BASE}/locations/closest?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch closest locations');
    const data = await response.json();
    const normalized = normalizeLocationsResponse(data);
    return normalized.map(mapLocationToResponder);
  } catch (error) {
    console.error('Error fetching closest locations:', error);
    return [];
  }
}

// Get nearby locations within radius
export async function getNearbyLocations(
  latitude: number,
  longitude: number,
  params?: {
    radiusKm?: number;
    category?: string;
    limit?: number;
  }
): Promise<FirstResponder[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());
    if (params?.radiusKm) queryParams.append('radiusKm', params.radiusKm.toString());
    if (params?.category) queryParams.append('category', params.category.toUpperCase());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE}/locations/nearby?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch nearby locations');
    const data = await response.json();
    const normalized = normalizeLocationsResponse(data);
    return normalized.map(mapLocationToResponder);
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    return [];
  }
}

