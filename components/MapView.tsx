'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Shield, MapPin, Navigation, Menu, X, Settings } from 'lucide-react';
import { FirstResponder, FilterState } from '@/types';
import { dummyFirstResponders } from '@/data/dummyData';
import { createCategoryIcon } from '@/lib/mapIcons';
import Filters from './Filters';
import InfoCard from './InfoCard';
import MapController from './MapController';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@keystone.app');
  const [adminPassword, setAdminPassword] = useState('demo1234');
  const [filters, setFilters] = useState<FilterState>({
    title: '',
    category: 'All',
    city: '',
    state: '',
  });

  // Load dummy data
  useEffect(() => {
    setResponders(dummyFirstResponders);
    setFilteredResponders(dummyFirstResponders);
  }, []);

  // Get unique cities and states
  const availableCities = useMemo(() => {
    const cities = new Set(responders.map((r) => r.city));
    return Array.from(cities).sort();
  }, [responders]);

  const availableStates = useMemo(() => {
    const states = new Set(responders.map((r) => r.state));
    return Array.from(states).sort();
  }, [responders]);

  // Filter responders based on filters
  useEffect(() => {
    let filtered = [...responders];

    if (filters.title.trim() !== '') {
      const query = filters.title.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          r.state.toLowerCase().includes(query) ||
          r.address.toLowerCase().includes(query)
      );
    }

    if (filters.category !== 'All') {
      filtered = filtered.filter((r) => r.category === filters.category);
    }

    if (filters.city !== '') {
      filtered = filtered.filter((r) => r.city === filters.city);
    }

    if (filters.state !== '') {
      filtered = filtered.filter((r) => r.state === filters.state);
    }

    setFilteredResponders(filtered);
  }, [filters, responders]);

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
  const handleResetFilters = () => {
    setFilters({ title: '', category: 'All', city: '', state: '' });
    setSelectedResponder(null);
    setMapCenter(null);
    setSettingsOpen(false);
  };

  const contactSupport = () => {
    const subject = encodeURIComponent('Support request - Keystone GeoResponse');
    const body = encodeURIComponent('Hi team,%0A%0AI need help with...%0A%0AThanks,');
    window.open(`mailto:support@keystone.app?subject=${subject}&body=${body}`, '_blank');
    setSettingsOpen(false);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg z-30 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Keystone GeoResponse</h1>
                <p className="text-blue-200 text-xs sm:text-sm">
                  {responders.length} First Responders across India
                </p>
              </div>
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
                className="md:hidden p-2 hover:bg-blue-800 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            availableCities={availableCities}
            availableStates={availableStates}
            resultCount={filteredResponders.length}
          />

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredResponders.length === 0 ? (
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

            {filteredResponders.map((responder) => (
              <Marker
                key={responder.id}
                position={[responder.locationLat, responder.locationLng]}
                icon={createCategoryIcon(responder.category)}
                eventHandlers={{
                  click: () => handleResponderClick(responder),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{responder.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">Category:</span> {responder.category}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">City:</span> {responder.city}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">State:</span> {responder.state}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Phone:</span> {responder.phoneNumber}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* My Location Button */}
          <div className="absolute bottom-4 right-4 z-[1000]">
            <LocationButton onLocationClick={handleMyLocation} />
          </div>

          {/* Info Card Overlay */}
          {selectedResponder && (
            <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[1000]">
              <InfoCard responder={selectedResponder} onClose={closeInfoCard} />
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="admin@keystone.app"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={() => {
                  window.location.href = '/admin';
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

