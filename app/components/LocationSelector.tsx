"use client";
import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";

interface LocationData {
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

interface LocationSelectorProps {
  location: LocationData | null;
  onChange: (location: LocationData | null) => void;
  error?: string;
}

export default function LocationSelector({ location, onChange, error }: LocationSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string>("");

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode using Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'FlexiGo-App/1.0'
              }
            }
          );

          if (!response.ok) throw new Error("Failed to fetch location details");

          const data = await response.json();
          const address = data.address || {};

          // Sri Lanka Address Mapping:
          // - City/Town: city, town, village, suburb, neighbourhood
          // - District: state_district (e.g., "Colombo District"), county, district
          // - Province: state (e.g., "Western Province")
          
          // Get city - prioritize more specific to less specific
          const city = 
            address.city || 
            address.town || 
            address.village || 
            address.suburb || 
            address.neighbourhood ||
            address.municipality ||
            "Unknown";

          // Get district - in Sri Lanka, districts are in state_district field
          // Remove "District" suffix if present for cleaner display
          let district = 
            address.state_district || 
            address.district ||
            address.county || 
            "Unknown";
          
          // Clean up district name (remove "District" word if present)
          if (district && district.toLowerCase().includes("district")) {
            district = district.replace(/\s*district\s*/i, "").trim();
          }

          const locationData: LocationData = {
            city,
            district,
            latitude,
            longitude,
            formattedAddress: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          };

          onChange(locationData);
          setLoading(false);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          // Still save coordinates even if reverse geocoding fails
          onChange({
            city: "",
            district: "",
            latitude,
            longitude,
            formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          setGpsError("Location detected but couldn't determine address. Please enter manually.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Please enable location access."
            : "Failed to get your location. Please enter manually."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualChange = (field: keyof LocationData, value: string | number) => {
    onChange({
      city: location?.city || "",
      district: location?.district || "",
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      formattedAddress: location?.formattedAddress,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* GPS Location Button */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Current Location
        </label>
        
        <Button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Detecting Location...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              Use My Current Location
            </>
          )}
        </Button>

        {gpsError && (
          <p className="mt-2 text-sm text-amber-600 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {gpsError}
          </p>
        )}

        {location?.formattedAddress && (
          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{location.formattedAddress}</span>
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-gray-500 font-medium">OR ENTER MANUALLY</span>
        </div>
      </div>

      {/* Manual Location Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City / Town
          </label>
          <Input
            type="text"
            value={location?.city || ""}
            onChange={(e) => handleManualChange("city", e.target.value)}
            placeholder="e.g., Colombo"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District / Province
          </label>
          <Input
            type="text"
            value={location?.district || ""}
            onChange={(e) => handleManualChange("district", e.target.value)}
            placeholder="e.g., Western Province"
            className="w-full"
          />
        </div>
      </div>

      {/* Hidden Coordinate Display (for debugging) */}
      {location?.latitude && location?.longitude && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Technical Details
          </summary>
          <div className="mt-2 bg-gray-50 p-2 rounded font-mono">
            <div>Latitude: {location.latitude.toFixed(6)}</div>
            <div>Longitude: {location.longitude.toFixed(6)}</div>
          </div>
        </details>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
