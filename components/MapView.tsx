'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Image from 'next/image';
import { Shield, MapPin, Navigation, Menu, X, Settings, Eye, EyeOff } from 'lucide-react';
import { FirstResponder, FilterState, GeoSuggestion } from '@/types';
import { createCategoryIcon } from '@/lib/mapIcons';
import { getAllLocations, getClosestLocations, getNearbyLocations } from '@/lib/api';
import { initGooglePlaces, getAutocompleteSuggestions, getPlaceDetails, refreshSessionToken } from '@/lib/googlePlaces';
import Filters from './Filters';
import InfoCard from './InfoCard';
import MapController from './MapController';
import MarkerClusterGroup from './MarkerClusterGroup';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

function LocationButton({ onLocationClick }: { onLocationClick: () => void }) {
  return (
    <button
      onClick={onLocationClick}
      className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
      aria-label="My Location"
    >
      <Navigation className="w-5 h-5 text-blue-600" />
    </button>
  );
}

export default function MapView() {
  const [responders, setResponders] = useState<FirstResponder[]>([]);
  const [filteredResponders, setFilteredResponders] = useState<FirstResponder[]>([]);
  const [selectedResponder, setSelectedResponder] = useState<FirstResponder | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@keystone.app');
  const [adminPassword, setAdminPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<GeoSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState<[number, number] | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [googlePlacesReady, setGooglePlacesReady] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    title: '',
    category: 'All',
    categories: [],
    city: '',
    state: '',
  });

  // Initialize Google Places API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      initGooglePlaces(apiKey)
        .then(() => {
          setGooglePlacesReady(true);
        })
        .catch((error) => {
          console.error('Failed to initialize Google Places:', error);
        });
    }
  }, []);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllLocations();
      setResponders(data);
      setFilteredResponders(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all locations from backend on mount
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // Get unique cities and states
  const availableCities = useMemo(() => {
    const cities = new Set(responders.map((r) => r.city));
    return Array.from(cities).sort();
  }, [responders]);

  const availableStates = useMemo(() => {
    const states = new Set(responders.map((r) => r.state));
    return Array.from(states).sort();
  }, [responders]);

  // Derive selected category (single-select)
  const selectedCategory = useMemo(() => {
    if (filters.categories && filters.categories.length > 0) return filters.categories[0];
    if (filters.category !== 'All') return filters.category;
    return undefined;
  }, [filters.categories, filters.category]);

  // Fetch from backend when filters change (no search origin)
  useEffect(() => {
    if (searchOrigin) return; // location-based flow handled elsewhere

    const loadFiltered = async () => {
      setLoading(true);
      try {
        const data = await getAllLocations({
          category: selectedCategory,
          cityName: filters.city || undefined,
          address: filters.title || undefined,
        });
        setResponders(data);
        setFilteredResponders(data);
        setDistances({});
      } catch (error) {
        console.error('Error loading filtered locations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFiltered();
  }, [filters.title, filters.city, filters.state, filters.categories, filters.category, selectedCategory, searchOrigin]);

  // If searchOrigin exists, distances already computed in handleSuggestionSelect; keep list as-is

  const handleResponderClick = (responder: FirstResponder) => {
    setSelectedResponder(responder);
    setMapCenter([responder.locationLat, responder.locationLng]);
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const closeInfoCard = () => {
    setSelectedResponder(null);
  };

  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const handleResetFilters = () => {
    setFilters({ title: '', category: 'All', categories: [], city: '', state: '' });
    setSelectedResponder(null);
    setMapCenter(null);
    setSearchOrigin(null);
    setDistances({});
    setSettingsOpen(false);
    loadLocations();
  };

  const contactSupport = () => {
    const subject = encodeURIComponent('Support request - Keystone GeoResponse');
    const body = encodeURIComponent('Hi team,%0A%0AI need help with...%0A%0AThanks,');
    window.open(`mailto:support@keystone.app?subject=${subject}&body=${body}`, '_blank');
    setSettingsOpen(false);
  };

  const fetchFallbackSuggestions = async (query: string) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&countrycodes=in`
      );
      const data = await resp.json();
      return (data || []).map((item: any) => ({
        label: item.display_name as string,
        lat: Number(item.lat),
        lon: Number(item.lon),
        placeId: undefined,
      })) as GeoSuggestion[];
    } catch (error) {
      console.error('Fallback geocode error', error);
      return [];
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 1) {
      setSearchSuggestions([]);
      return;
    }

    setSearchLoading(true);
    try {
      let mapped: GeoSuggestion[] = [];

      if (googlePlacesReady) {
        const suggestions = await getAutocompleteSuggestions(query, {
          includedRegionCodes: ['in'],
        });
        mapped = suggestions.map((s) => ({
          label: s.text,
          lat: 0, // Will be fetched when selected
          lon: 0,
          placeId: s.placeId,
        }));
      }

      // If Places not ready or returned nothing, fallback to Nominatim
      if (!googlePlacesReady || mapped.length === 0) {
        mapped = await fetchFallbackSuggestions(query);
      }

      setSearchSuggestions(mapped);
    } catch (e) {
      console.error('Autocomplete error', e);
      setSearchSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFilters((prev) => ({ ...prev, title: value }));
    setSearchOrigin(null);
    setDistances({});

    // Debounce the search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = async (s: GeoSuggestion) => {
    setSearchLoading(true);
    setSearchSuggestions([]);

    try {
      let lat = s.lat;
      let lon = s.lon;
      let displayName = s.label;

      // If we have a placeId, fetch full details
      if (s.placeId) {
        const placeDetails = await getPlaceDetails(s.placeId);
        if (placeDetails) {
          lat = placeDetails.location.lat;
          lon = placeDetails.location.lng;
          displayName = placeDetails.displayName || placeDetails.formattedAddress;
        }
      }

      console.log('Selected place:', {
        displayName,
        lat,
        lon,
        placeId: s.placeId,
      });

      setFilters((prev) => ({ ...prev, title: displayName }));
      const center: [number, number] = [lat, lon];
      setMapCenter(center);
      setSearchOrigin(center);

      // Fetch nearby first; if none, fallback to closest
      const nearby = await getNearbyLocations(lat, lon, {
        radiusKm: 20,
        limit: 50,
        category: selectedCategory,
      });
      const closest =
        nearby.length === 0
          ? await getClosestLocations(lat, lon, { limit: 20, category: selectedCategory })
          : [];

      // Combine and deduplicate by ID
      const allResults = [...nearby, ...closest];
      const uniqueResults = Array.from(new Map(allResults.map((item) => [item.id, item])).values());

      // Calculate distances
      const newDistances: Record<string, number> = {};
      uniqueResults.forEach((r) => {
        const dist = haversineKm(lat, lon, r.locationLat, r.locationLng);
        newDistances[r.id] = dist;
      });

      // Sort by distance
      uniqueResults.sort((a, b) => {
        const distA = newDistances[a.id] || Infinity;
        const distB = newDistances[b.id] || Infinity;
        return distA - distB;
      });

      console.log('Locations after closest/nearby:', {
        count: uniqueResults.length,
        sample: uniqueResults.slice(0, 5),
      });

      setResponders(uniqueResults);
      setFilteredResponders(uniqueResults);
      setDistances(newDistances);

      // Refresh session token for next search
      refreshSessionToken();
    } catch (error) {
      console.error('Error selecting place:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Re-run nearby/closest when category changes while a search origin exists
  useEffect(() => {
    const refetchAroundOrigin = async () => {
      if (!searchOrigin) return;
      const [lat, lon] = searchOrigin;
      setLoading(true);
      try {
        const nearby = await getNearbyLocations(lat, lon, {
          radiusKm: 20,
          limit: 50,
          category: selectedCategory,
        });
        const closest =
          nearby.length === 0
            ? await getClosestLocations(lat, lon, { limit: 20, category: selectedCategory })
            : [];

        const allResults = [...nearby, ...closest];
        const uniqueResults = Array.from(new Map(allResults.map((item) => [item.id, item])).values());

        const newDistances: Record<string, number> = {};
        uniqueResults.forEach((r) => {
          const dist = haversineKm(lat, lon, r.locationLat, r.locationLng);
          newDistances[r.id] = dist;
        });

        uniqueResults.sort((a, b) => {
          const distA = newDistances[a.id] || Infinity;
          const distB = newDistances[b.id] || Infinity;
          return distA - distB;
        });

        setResponders(uniqueResults);
        setFilteredResponders(uniqueResults);
        setDistances(newDistances);
      } catch (error) {
        console.error('Error reloading around origin:', error);
      } finally {
        setLoading(false);
      }
    };

    refetchAroundOrigin();
  }, [searchOrigin, selectedCategory]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white text-white shadow-lg z-30 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Image
                  src="/logo.webp"
                  alt="Keystone GeoResponse"
                  width={140}
                  height={40}
                  className="h-10 w-auto sm:h-12"
                  priority
                />
              {/* <div>
                <h1 className="text-lg sm:text-2xl font-bold">Keystone GeoResponse</h1>
                <p className="text-blue-200 text-xs sm:text-sm">
                  {responders.length} First Responders across India
                </p>
              </div> */}
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setSettingsOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-12 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 w-56 z-40">
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-sm cursor-pointer"
                    onClick={() => {
                      setShowAdminLogin(true);
                      setSettingsOpen(false);
                    }}
                  >
                    Admin Dashboard
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer"
                    onClick={handleResetFilters}
                  >
                    <span className="text-gray-800">Reset filters & view</span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer"
                    onClick={contactSupport}
                  >
                    <span className="text-gray-800">Contact support</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 absolute md:relative z-20 w-full md:w-96 bg-white border-r border-gray-200 shadow-lg overflow-hidden flex flex-col transition-transform duration-300 ease-in-out h-full`}
        >
          {/* Filters */}
          <Filters
            filters={filters}
            onFilterChange={setFilters}
            onTitleChange={handleTitleChange}
            suggestions={searchSuggestions}
            onSuggestionSelect={handleSuggestionSelect}
            searchLoading={searchLoading}
            availableCities={availableCities}
            availableStates={availableStates}
            resultCount={filteredResponders.length}
            onClearAll={handleResetFilters}
          />

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400 p-8 text-center">
                <div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg">Loading locations...</p>
                </div>
              </div>
            ) : filteredResponders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 p-8 text-center">
                <div>
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No results found</p>
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredResponders.map((responder) => (
                  <button
                    key={responder.id}
                    onClick={() => handleResponderClick(responder)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors cursor-pointer ${
                      selectedResponder?.id === responder.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin
                        className={`w-5 h-5 flex-shrink-0 mt-1 ${
                          responder.category === 'Police'
                            ? 'text-blue-600'
                            : responder.category === 'Fire'
                            ? 'text-red-600'
                            : responder.category === 'Ambulance'
                            ? 'text-green-600'
                            : responder.category === 'Hospital'
                            ? 'text-orange-600'
                            : 'text-purple-600'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {responder.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              responder.category === 'Police'
                                ? 'bg-blue-100 text-blue-800'
                                : responder.category === 'Fire'
                                ? 'bg-red-100 text-red-800'
                                : responder.category === 'Ambulance'
                                ? 'bg-green-100 text-green-800'
                                : responder.category === 'Hospital'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {responder.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {responder.city}, {responder.state}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {responder.address}
                        </p>
                        {typeof distances[responder.id] === 'number' && (
                          <p className="text-xs text-blue-600 mt-1">
                            {distances[responder.id].toFixed(1)} km away
                          </p>
                        )}
                        <p className="text-xs text-blue-600 mt-1">{responder.phoneNumber}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            minZoom={5}
            maxZoom={18}
            maxBounds={[[6, 68], [36, 98]]}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapController center={mapCenter} zoom={15} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MarkerClusterGroup
              markers={filteredResponders}
              onMarkerClick={handleResponderClick}
              distances={distances}
            />
          </MapContainer>

          {/* My Location Button */}
          <div className="absolute bottom-4 right-4 z-[1000]">
            <LocationButton onLocationClick={handleMyLocation} />
          </div>

          {/* Info Card Overlay */}
          {selectedResponder && (
            <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[1000]">
              <InfoCard
                responder={selectedResponder}
                distanceKm={distances[selectedResponder.id]}
                onClose={closeInfoCard}
              />
            </div>
          )}
        </div>
      </div>

      {/* Admin login modal */}
      {showAdminLogin && (
        <div
          className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center px-4"
          onClick={() => setShowAdminLogin(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close admin login"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-6">
              {/* <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                <Settings className="w-5 h-5" />
              </div> */}
              <div>
                <h3 className="text-xl font-bold">Admin Access</h3>
                <p className="text-sm text-gray-500">Enter credentials to manage data</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  onFocus={() => setAdminError('')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="admin@keystone.app"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onFocus={() => setAdminError('')}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-2 px-2 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {adminError && <p className="text-sm text-red-600">{adminError}</p>}
              <button
                onClick={() => {
                  if (adminEmail === 'admin@keystone.app' && adminPassword === 'demo1234') {
                    window.location.href = '/admin';
                  } else {
                    setAdminError('Invalid email or password.');
                  }
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Continue to Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

