'use client';

import { FirstResponder } from '@/types';
import { Phone, Globe, MapPin, X } from 'lucide-react';

interface InfoCardProps {
  responder: FirstResponder;
  distanceKm?: number;
  onClose: () => void;
}

export default function InfoCard({ responder, distanceKm, onClose }: InfoCardProps) {
  const handleCall = () => {
    window.location.href = `tel:${responder.phoneNumber}`;
  };

  const handleWebsite = () => {
    if (responder.websiteUrl) {
      window.open(responder.websiteUrl, '_blank');
    }
  };

  const handleDirections = () => {
    window.open(responder.googleLocationUrl, '_blank');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Police':
        return 'bg-blue-100 text-blue-800';
      case 'Fire':
        return 'bg-red-100 text-red-800';
      case 'Ambulance':
        return 'bg-green-100 text-green-800';
      case 'Hospital':
        return 'bg-orange-100 text-orange-800';
      case 'Emergency':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6 max-w-sm w-full mx-0">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                responder.category
              )}`}
            >
              {responder.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {responder.title}
          </h3>
          <p className="text-sm text-gray-600">{responder.city}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">{responder.address}</p>
        </div>
        {typeof distanceKm === 'number' && (
          <p className="text-sm text-blue-600 font-medium">{distanceKm.toFixed(1)} km away</p>
        )}
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-400" />
          <a
            href={`tel:${responder.phoneNumber}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {responder.phoneNumber}
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        {responder.websiteUrl && (
          <button
            onClick={handleWebsite}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
            Website
          </button>
        )}
        <button
          onClick={handleDirections}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          <MapPin className="w-4 h-4" />
          Directions
        </button>
      </div>
    </div>
  );
}

