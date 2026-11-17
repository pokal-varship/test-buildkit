"use client";

import React, { useCallback, useEffect, useState } from "react";
import { TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import Icon from "@components/image/Icons";
import {
  ADDRESS_PIN_ICON,
  CLOSE_CIRCLE_ICON,
  LOCATE_ME_ICON,
  SEARCH_ICON,
} from "@config/Header/image.config";
import { getAddressFromCoordinates, getSearchAddress } from "@services/location";
import { LocationAddress } from "./checkout.type";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { debounce } from "lodash";
import { useAnalytics } from "@hooks/useAnalytics";

interface NominatimResponse {
  display_name?: string;
  lat?: string | number;
  lon?: string | number;
  address?: {
    office?: string;
    road?: string;
    postcode?: string;
    suburb?: string;
    state_district?: string;
    country?: string;
    city?: string;
    state?: string;
  };
}

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: ADDRESS_PIN_ICON,
  iconUrl: ADDRESS_PIN_ICON,
  shadowUrl: undefined,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const ShowMapWithSearch = ({
  handleCurrentLocation,
  editData,
}: {
  handleCurrentLocation: (location: LocationAddress) => void;
  editData?: LocationAddress;
}) => {
  const store = useSelector((state: RootState) => state.store);
  const location = useSelector((state: RootState) => state.location);
  const { trackLocation } = useAnalytics();
  const [coords, setCoords] = useState<[number, number]>([
    location.latitude ?? 0,
    location.longitude ?? 0,
  ]);
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState<LocationAddress[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const map = useMap();

  const handleSetMapCenter = (center: [number, number]) => {
    map.setView(center, 15);
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setCoords([location.latitude, location.longitude]);
      handleSetMapCenter([location.latitude, location.longitude]);
    }
  }, [location]);

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;

    try {
      let options;
      if(store.currentStore?.address.coordinates.latitude) {
        options = {
          lat: store.currentStore?.address?.coordinates?.latitude || undefined,
          lon: store.currentStore?.address?.coordinates?.longitude || undefined,
          radius: 200,
        }
      }
      const res = await getSearchAddress(searchText, options);
      if (res.length > 0) {
        setPlace(res); // ✅ Only update suggestion list
      } else {
        setPlace([]);
      }
    } catch {

    }
  };

  const handleSelectSuggestion = async (suggestion: LocationAddress) => {
    setPlace([]);
    setAddress(suggestion.display_name);
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setCoords([lat, lon]); // ✅ Move the map now
    handleSetMapCenter([lat, lon]);
    handleCurrentLocation(suggestion);
    
    // Track manual location selection
    if (suggestion.address?.country && suggestion.address?.state) {
      const city = suggestion.address?.city || suggestion.address?.state_district || "";
      const state = suggestion.address?.state || "";
      const country = suggestion.address?.country || "";
      await trackLocation(city, state, country, "manual");
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

  const normalizeLocation = useCallback(
    (data: NominatimResponse, fallbackLat: number, fallbackLon: number): LocationAddress => ({
      display_name: data?.display_name ?? `${fallbackLat}, ${fallbackLon}`,
      lat: (data?.lat ?? fallbackLat).toString(),
      lon: (data?.lon ?? fallbackLon).toString(),
      address: {
        office: data?.address?.office,
        road: data?.address?.road,
        postcode: data?.address?.postcode,
        suburb: data?.address?.suburb,
        state_district: data?.address?.state_district,
        country: data?.address?.country,
        city: data?.address?.city,
        state: data?.address?.state,
      },
    }),
    []
  );

  const handleReverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const res = await getAddressFromCoordinates(latitude, longitude);
        if (res) {
          return normalizeLocation(res, latitude, longitude);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
      return null;
    },
    [normalizeLocation]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearch(address);
    }
  };

  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);

    try {
      // First try using navigator.geolocation for better error handling
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          handleSetMapCenter([latitude, longitude]);

          const normalizedLocation = await handleReverseGeocode(
            latitude,
            longitude
          );
          if (normalizedLocation) {
            handleCurrentLocation(normalizedLocation);
            setAddress(normalizedLocation.display_name);
            
            // Track auto-detect location
            if (normalizedLocation.address?.country && normalizedLocation.address?.state) {
              const city = normalizedLocation.address?.city || normalizedLocation.address?.state_district || "";
              const state = normalizedLocation.address?.state || "";
              const country = normalizedLocation.address?.country || "";
              await trackLocation(city, state, country, "auto_detect");
            }
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
          // Fallback to Leaflet's locate method
          map.locate({
            setView: true,
            enableHighAccuracy: true,
            maximumAge: 0,
            maxZoom: 16,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Error accessing geolocation:', error);
      setIsLocating(false);
      // Fallback to Leaflet's locate method
      map.locate({
        setView: true,
        enableHighAccuracy: true,
        maximumAge: 0,
        maxZoom: 16,
      });

      // navigator.geolocation.getCurrentPosition(
      //   async (position) => {
      //     const { latitude, longitude } = position.coords;
      //     setCoords([latitude, longitude]);

      //     try {
      //       const res = await getSearchAddress(`${latitude},${longitude}`);
      //       if (res && res.length > 0) {
      //         handleCurrentLocation(res[0]);
      //         setAddress('')
      //       }
      //     } catch (error) {
      //       console.error('Reverse geocoding failed', error);
      //     }
      //   },
      // );
    }
  };

  useEffect(() => {
    if (!editData) {
      handleLocateMe();
    }
  }, []);

  useEffect(() => {
    const handleLocationFound = async (data: L.LocationEvent) => {
      const lat = data.latlng.lat;
      const lng = data.latlng.lng;
      setCoords([lat, lng]);
      handleSetMapCenter([lat, lng]);

      handleReverseGeocode(lat, lng).then((normalizedLocation) => {
        if (normalizedLocation) {
          handleCurrentLocation(normalizedLocation);
          setAddress(normalizedLocation.display_name);
        }
        setIsLocating(false);
      });
    };

    const handleLocationError = (error: L.ErrorEvent) => {
      console.error('Location error:', error);
      setIsLocating(false);
      // You could show a toast or alert here to inform the user
    };

    map.on("locationfound", handleLocationFound);
    map.on("locationerror", handleLocationError);
    
    return () => {
      map.off("locationfound", handleLocationFound);
      map.off("locationerror", handleLocationError);
    };
  }, [map]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    if (value.length > 0) {
      debouncedSearch(value);
    } else {
      setPlace([]);
    }
  };

  return (
    <div>
      <div className="search-input-wrapper">
        <Icon
          icon={`${SEARCH_ICON}#search-icon`}
          width={20}
          height={20}
          color={"var(--primary-text)"}
          className="search-icon"
          viewBox="0 0 21 20"
        />
        <input
          type="text"
          placeholder={lang.searchLocation}
          value={address}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="search-location-input"
        />
        {address.length > 0 && (
          <Icon
            icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
            width={20}
            height={20}
            color={"var(--primary-text)"}
            className="cursor-pointer mr-2"
            viewBox="0 0 25 25"
            onClick={() => {
              setAddress("");
              setPlace([]);
            }}
          />
        )}
      </div>

      {address.length > 0 && place.length > 0 && (
        <ul className="dropdown">
          {place.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="dropdown-item"
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker
        position={coords}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const latlng = e.target.getLatLng();
            const newCoords: [number, number] = [latlng.lat, latlng.lng];
            setCoords(newCoords);
            handleSetMapCenter(newCoords);
            handleReverseGeocode(latlng.lat, latlng.lng).then(
              (normalizedLocation) => {
                if (normalizedLocation) {
                  setAddress(normalizedLocation.display_name);
                  handleCurrentLocation(normalizedLocation);
                }
              }
            );
          },
        }}
      >
        <Popup>{address || "Selected Location"}</Popup>
      </Marker>

      <div className="locate-controls">
        <button 
          onClick={handleLocateMe} 
          className="locate-me-btn"
          disabled={isLocating}
        >
          <Icon
            icon={`${LOCATE_ME_ICON}#locate`}
            width={20}
            height={20}
            color="var(--primary-text)"
            viewBox="0 0 24 24"
            className={`locate-icon ${isLocating ? 'spinning' : ''}`}
          />
          {isLocating ? 'Locating...' : lang.locateMe}
        </button>
      </div>

      <style>{`
        .search-input-wrapper {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 92%;
          z-index: 1001;
          display: flex;
          align-items: center;
          background: var(--cards-containers);
          border-radius: 8px;
          border: 1px solid var(--borders-dividers);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding-left: 10px;
        }

        .search-icon {
          margin-right: 6px;
          flex-shrink: 0;
        }

        .search-location-input {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          color: var(--primary-text);
        }

        .search-location-input:focus {
          outline: none;
          font-size: var(--description-font) !important;
        }

        .search-location-input::placeholder {
          color: var(--secondary-text);
          font-size: var(--description-font);
        }

        .locate-controls {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1001;
        }

        .locate-icon {
          cursor: pointer;
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease;
        }

        .locate-icon:hover {
          transform: scale(1.1);
        }

        .locate-me-btn {
          padding: 6px 10px;
          border-radius: 8px;
          background: var(--cards-containers);
          border: 1px solid #517ee5;
          color: #517ee5;
          font-weight: var(--font-medium);
          cursor: pointer;
          font-size: var(--heading-h4);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .locate-me-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .locate-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .dropdown {
          position: absolute;
          top: 51px;
          left: 16px;
          width: 92%;
          background-color: var(--cards-containers);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          list-style-type: none;
          padding: 0;
          margin: 0;
          max-height: 150px;
          overflow-y: auto;
          z-index: 1001;
          color: var(--primary-text);
        }

        .dropdown-item {
          padding: 8px;
          cursor: pointer;
          background-color: var(--cards-containers);
        }

        .dropdown-item:hover {
          background-color: var(--primary-background);
        }

        .leaflet-control-container {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default ShowMapWithSearch;
