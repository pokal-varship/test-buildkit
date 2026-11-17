import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { setLocation, setUserAddress } from "@redux/slices/locationSlice";
import {
  fetchIPInfo,
  getAddressFromCoordinates,
  getSearchAddress,
} from "@services/location";
import { UserAddress } from "types/userAddress.types";
import { setCookie } from "@lib/cookie";
import { getBrowserTimezone, resolveTimezone } from "@lib/helper";
import { useAnalytics } from "@hooks/useAnalytics";

const getClientTimezone = (): string => resolveTimezone(getBrowserTimezone());

interface AddressSuggestion {
  address: UserAddress;
  display_name: string;
  lat: number;
  lon: number;
}

export function useAddress() {
  const dispatch = useDispatch();
  const userAddress = useSelector(
    (state: RootState) => state.location.userAddress,
  );
  const [suggestions, setSuggestions] = useState<UserAddress[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isLocationPermission = useRef(false);
  const { trackLocation } = useAnalytics();

  const fetchLocation = async (): Promise<boolean> => {
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setTimeout(async () => {
        if (permission.state === "prompt" && !userAddress) {
          await fetchIP();
          return false;
        }
      }, 2000);

      if (permission.state === "denied") {
        await fetchIP();
        return false;
      }

      if (!navigator.geolocation) {
        return false;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            dispatch(setLocation({ latitude, longitude }));
            setCookie("lattitude", latitude?.toString?.());
            setCookie("longitude", longitude?.toString?.());
            setCookie("client_timezone", getClientTimezone());
            fetchAddress(latitude, longitude, "auto_detect");
            isLocationPermission.current = true;
            resolve(true);
          },
          async () => {
            // Error handled by fetching IP as fallback
            await fetchIP();
          },
          {
            enableHighAccuracy: false,
            timeout: 2000,
            maximumAge: 0,
          },
        );
      });
    } catch {
      // Error handled by fetching IP as fallback
      await fetchIP();
      return false;
    }
  };

  const fetchAddress = async (
    lat: number,
    lon: number,
    method: "auto_detect" | "manual" = "auto_detect",
  ) => {
    if (!lat || !lon) {
      return;
    }
    try {
      const data = await getAddressFromCoordinates(lat, lon);
      const address = { ...data.address, display_name: data.display_name };
      dispatch(setUserAddress(address));
      // Track location set
      if (address.country && address.state) {
        const city = address.county || address.state_district || "";
        const state = address.state || "";
        const country = address.country_code || address.country || "";
        await trackLocation(city, state, country, method);
      }
    } catch {
      // Error handled silently
    }
  };

  const handleAddressChange = async () => {
    setSuggestions([]);
    return fetchLocation();
  };

  const fetchIP = async () => {
    try {
      const data = await fetchIPInfo();

      // Check if data exists and has the required loc property
      if (!data || !data.loc) {
        console.warn("IP info data is missing or invalid");
        return;
      }

      const locationParts = data.loc.split(",");
      if (locationParts.length < 2) {
        console.warn("Invalid location format from IP info");
        return;
      }

      const [latitude, longitude] = locationParts;

      // fetchAddress will handle tracking, so we just need to set the address
      await fetchAddress(
        parseFloat(latitude),
        parseFloat(longitude),
        "auto_detect",
      );
      isLocationPermission.current = true;

      dispatch(
        setLocation({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      );

      setCookie("lattitude", latitude?.toString?.());
      setCookie("longitude", longitude?.toString?.());
      setCookie("client_timezone", getClientTimezone());

      // If fetchAddress didn't set the address (e.g., API failed), set it from IP data
      const address = {
        display_name: `${data.city || ""}, ${data.region || ""}, ${data.postal || ""}, ${data.country || ""}`,
        county: data.city,
        state_district: data.region,
        state: data.region,
        "ISO3166-2-lvl4": data["ISO3166-2-lvl4"],
        postcode: data.postal,
        country: data.country,
        country_code: data.country_code,
      };

      dispatch(setUserAddress(address));
    } catch (error) {
      console.error("Error fetching IP location:", error);
    }
  };

  const handleInputDataChange = useCallback(async (address: string) => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await getSearchAddress(address);
      const data = response;
      if (data.length > 0) {
        setSuggestions(
          data.map((item: AddressSuggestion) => {
            return {
              ...item.address,
              display_name: item.display_name,
              longitude: item.lon,
              latitude: item.lat,
            };
          }),
        );
      } else {
        setSuggestions([]);
      }
    } catch {
      // Error handled silently
    }
  }, []);

  const handleChange = (value: string) => {
    handleInputDataChange(value);
    setShowDropdown(true);
  };

  const handleSelect = async (value: string | { [key: string]: string }) => {
    // handleInputDataChange(value);
    setShowDropdown(false);
    dispatch(setUserAddress(value));

    if (
      typeof value === "object" &&
      "latitude" in value &&
      "longitude" in value
    ) {
      dispatch(
        setLocation({
          latitude: Number(value.latitude),
          longitude: Number(value.longitude),
        }),
      );
      setCookie("lattitude", value.latitude.toString?.());
      setCookie("longitude", value.longitude.toString?.());
      setCookie("client_timezone", getClientTimezone());

      // Track manual location selection
      const address: any = value;
      const city = (address.county || address.state_district || "") as string;
      const state = (address.state || "") as string;
      const country = (address.country_code || address.country || "") as string;

      if (city && state && country) {
        await trackLocation(city, state, country, "manual");
      }
    }
  };

  return {
    userAddress,
    suggestions,
    showDropdown,
    handleChange,
    handleSelect,
    setShowDropdown,
    handleAddressChange,
    fetchLocation,
  };
}
