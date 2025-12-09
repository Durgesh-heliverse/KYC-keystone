// Google Places Autocomplete using the classic Places library
// Reference: https://developers.google.com/maps/documentation/javascript/places-autocomplete

declare global {
  interface Window {
    google: any;
  }
}

export interface GooglePlaceSuggestion {
  placeId: string;
  text: string;
  structuredFormat: {
    mainText: string;
    secondaryText: string;
  };
}

export interface GooglePlace {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
}

let googleMapsLoaded = false;
let autocompleteService: any = null;
let placesService: any = null;

// Initialize Google Places API
export async function initGooglePlaces(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (googleMapsLoaded) return;

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      setupServices();
      googleMapsLoaded = true;
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          setupServices();
          googleMapsLoaded = true;
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!googleMapsLoaded) {
          reject(new Error('Timeout waiting for Google Maps to load'));
        }
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setupServices();
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      reject(new Error('Failed to load Google Maps API'));
    };
    document.head.appendChild(script);
  });
}

function setupServices() {
  if (!window.google?.maps?.places) {
    console.error('Google Maps Places library not available');
    return;
  }
  
  try {
    autocompleteService = new window.google.maps.places.AutocompleteService();
    // PlacesService needs an HTML element; use a detached div
    const dummyDiv = document.createElement('div');
    placesService = new window.google.maps.places.PlacesService(dummyDiv);
  } catch (error) {
    console.error('Error setting up Places services:', error);
  }
}

// Get autocomplete suggestions
export async function getAutocompleteSuggestions(
  input: string,
  options?: {
    includedRegionCodes?: string[];
  }
): Promise<GooglePlaceSuggestion[]> {
  if (!googleMapsLoaded || !autocompleteService || !input || input.length < 2) {
    return [];
  }

  return new Promise((resolve) => {
    if (!autocompleteService) {
      resolve([]);
      return;
    }

    const request: any = {
      input,
      // Use single country string for better compatibility
      componentRestrictions: { country: options?.includedRegionCodes?.[0] || 'in' },
      // Allow addresses and POIs
      types: ['geocode', 'establishment'],
    };

    autocompleteService.getPlacePredictions(request, (predictions: any, status: any) => {
      if (
        status !== window.google.maps.places.PlacesServiceStatus.OK ||
        !predictions
      ) {
        if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.warn('Places API status:', status, 'predictions:', predictions);
        }
        resolve([]);
        return;
      }

      resolve(
        predictions.map((p: any) => ({
          placeId: p.place_id || '',
          text: p.description || '',
          structuredFormat: {
            mainText: p.structured_formatting?.main_text || p.description || '',
            secondaryText: p.structured_formatting?.secondary_text || '',
          },
        }))
      );
    });
  });
}

// Get place details by place ID
export async function getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
  if (!googleMapsLoaded || !placesService) {
    return null;
  }

  return new Promise((resolve) => {
    if (!placesService) {
      resolve(null);
      return;
    }

    placesService.getDetails(
      {
        placeId,
        fields: ['place_id', 'name', 'formatted_address', 'geometry'],
      },
      (place: any, status: any) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place ||
          !place.geometry?.location
        ) {
          if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn('Places Details API status:', status);
          }
          resolve(null);
          return;
        }

        const location = place.geometry.location;
        resolve({
          placeId: place.place_id || placeId,
          displayName: place.name || '',
          formattedAddress: place.formatted_address || '',
          location: {
            lat: typeof location.lat === 'function' ? location.lat() : location.lat,
            lng: typeof location.lng === 'function' ? location.lng() : location.lng,
          },
        });
      }
    );
  });
}

// Refresh session token (not used in classic API, but kept for compatibility)
export function refreshSessionToken(): void {
  // Classic Places API doesn't use session tokens
  // This is a no-op for compatibility
}
