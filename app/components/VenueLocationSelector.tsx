"use client";
import { useState, useEffect, useRef } from "react";
import Input from "./ui/Input";

export interface VenueLocation {
  venueName: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

interface VenueLocationSelectorProps {
  location: VenueLocation | null;
  onChange: (location: VenueLocation | null) => void;
  error?: string;
}

interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    amenity?: string;
    building?: string;
    hotel?: string;
    restaurant?: string;
    shop?: string;
    office?: string;
    leisure?: string;
    tourism?: string;
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state_district?: string;
    district?: string;
    county?: string;
    postcode?: string;
  };
  type?: string;
  class?: string;
}

export default function VenueLocationSelector({ location, onChange, error }: VenueLocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial search query from location
  useEffect(() => {
    if (location?.venueName) {
      setSearchQuery(location.venueName);
    }
  }, [location?.venueName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for exact venue/location
  const searchVenue = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);

    try {
      // Search for specific places/venues in Sri Lanka
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)},Sri Lanka&` +
        `addressdetails=1&` +
        `limit=10&` +
        `extratags=1&` +
        `namedetails=1`,
        {
          headers: {
            'User-Agent': 'FlexiGo-App/1.0'
          }
        }
      );

      if (response.ok) {
        const data: NominatimSuggestion[] = await response.json();
        
        // Filter and prioritize specific venues (hotels, buildings, amenities, etc.)
        const filteredData = data.filter(item => {
          const addr = item.address;
          // Prioritize places with specific venue types
          return (
            addr?.amenity ||
            addr?.building ||
            addr?.hotel ||
            addr?.restaurant ||
            addr?.shop ||
            addr?.office ||
            addr?.leisure ||
            addr?.tourism ||
            item.type === 'building' ||
            item.type === 'amenity' ||
            item.class === 'tourism' ||
            item.class === 'amenity' ||
            item.class === 'building'
          );
        });

        // If no specific venues found, use all results
        setSuggestions(filteredData.length > 0 ? filteredData : data);
        setShowSuggestions(data.length > 0);
      }
    } catch (err) {
      console.error("Venue search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    // Clear location if user changes the input
    if (location && value !== location.venueName) {
      onChange(null);
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchVenue(value);
    }, 500);
  };

  // Extract venue name from Nominatim result
  const extractVenueName = (suggestion: NominatimSuggestion): string => {
    const addr = suggestion.address;
    
    // Prioritize specific venue names
    return (
      addr?.amenity ||
      addr?.building ||
      addr?.hotel ||
      addr?.restaurant ||
      addr?.shop ||
      addr?.office ||
      addr?.leisure ||
      addr?.tourism ||
      suggestion.display_name.split(',')[0] || // First part of display name
      "Unnamed Location"
    );
  };

  // Extract full address from Nominatim result
  const extractAddress = (suggestion: NominatimSuggestion): string => {
    const addr = suggestion.address;
    const parts: string[] = [];

    if (addr?.house_number) parts.push(addr.house_number);
    if (addr?.road) parts.push(addr.road);
    if (addr?.suburb) parts.push(addr.suburb);

    return parts.length > 0 ? parts.join(', ') : suggestion.display_name.split(',').slice(0, 2).join(',');
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: NominatimSuggestion) => {
    const address = suggestion.address || {};
    
    // Extract venue name
    const venueName = extractVenueName(suggestion);
    
    // Extract address
    const fullAddress = extractAddress(suggestion);
    
    // Extract city
    const city = 
      address.city || 
      address.town || 
      address.village || 
      "";

    // Extract district and clean it
    let district = 
      address.state_district || 
      address.district ||
      address.county || 
      "";
    
    if (district && district.toLowerCase().includes("district")) {
      district = district.replace(/\s*district\s*/i, "").trim();
    }

    const locationData: VenueLocation = {
      venueName,
      address: fullAddress,
      city,
      district,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    };

    setSearchQuery(venueName);
    onChange(locationData);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Venue Search */}
      <div className="relative" ref={suggestionsRef}>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <svg className="w-5 h-5 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Venue Location
        </label>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for venue (e.g., Galadari Hotel, Colombo Convention Center)"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            required
          />
          
          {searchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const venueName = extractVenueName(suggestion);
              const venueType = suggestion.address?.amenity || suggestion.type || suggestion.class;
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      <svg className="w-5 h-5 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{venueName}</p>
                      {venueType && (
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{venueType}</p>
                      )}
                      <p className="text-sm text-gray-600 truncate mt-1">{suggestion.display_name}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showSuggestions && suggestions.length === 0 && !searchLoading && searchQuery.length >= 3 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No venues found. Try a different search term.
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {location && location.latitude !== 0 && location.longitude !== 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900">{location.venueName}</p>
              {location.address && (
                <p className="text-sm text-green-700 mt-1">{location.address}</p>
              )}
              <p className="text-sm text-green-600 mt-1">
                {location.city}{location.district && `, ${location.district} District`}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Search for specific venues like hotels, convention centers, or office buildings. Results show exact locations with coordinates.
      </p>
    </div>
  );
}
