import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { GOOGLE_MAP_KEY } from "@/utils/constant.utils";

const LIBRARIES: ("places" | "geometry")[] = ["places"];
const DEFAULT_CENTER = { lat: 22.5, lng: 82.0 };

interface GoogleMapPickerProps {
  lat: any;
  lng: any;
  onChange: (lat: number, lng: number) => void;
}

const GoogleMapPicker = ({ lat, lng, onChange }: GoogleMapPickerProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_KEY,
    libraries: LIBRARIES,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [searchText, setSearchText] = useState("");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const geocodeRequestRef = useRef(0);

  const parse = (v: any) =>
    v !== null && v !== "" && v !== undefined ? parseFloat(v) : NaN;

  const initialMoveRef = useRef(false);

  const isSamePosition = (
    a: { lat: number; lng: number } | null,
    b: { lat: number; lng: number }
  ) => a?.lat === b.lat && a?.lng === b.lng;

  const moveTo = useCallback((latVal: number, lngVal: number) => {
    const p = { lat: latVal, lng: lngVal };
    setPos((current) => (isSamePosition(current, p) ? current : p));
    if (mapRef.current) {
      if (!initialMoveRef.current) {
        mapRef.current.setCenter(p);
        mapRef.current.setZoom(15);
        initialMoveRef.current = true;
      } else {
        mapRef.current.panTo(p);
      }
    }
  }, []);

  const reverseGeocode = useCallback((latVal: number, lngVal: number) => {
    const requestId = ++geocodeRequestRef.current;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: latVal, lng: lngVal } }, (results, status) => {
      if (requestId !== geocodeRequestRef.current) return;
      if (status === "OK" && results?.[0]) setSearchText(results[0].formatted_address);
    });
  }, []);

  const updateLocation = useCallback(
    (
      latVal: number,
      lngVal: number,
      options: {
        shouldNotify?: boolean;
        searchLabel?: string;
        shouldReverseGeocode?: boolean;
      } = {}
    ) => {
      if (isNaN(latVal) || isNaN(lngVal)) return;
      moveTo(latVal, lngVal);

      if (options.searchLabel !== undefined) {
        geocodeRequestRef.current += 1;
        setSearchText(options.searchLabel);
      } else if (options.shouldReverseGeocode) {
        reverseGeocode(latVal, lngVal);
      }

      if (options.shouldNotify) {
        onChangeRef.current(latVal, lngVal);
      }
    },
    [moveTo, reverseGeocode]
  );

  // Sync from props (edit page load or manual lat/lng input)
  useEffect(() => {
    if (!isLoaded || !mapReady) return;
    const latVal = parse(lat);
    const lngVal = parse(lng);
    if (isNaN(latVal) || isNaN(lngVal)) return;
    updateLocation(latVal, lngVal, { shouldReverseGeocode: true });
  }, [lat, lng, isLoaded, mapReady, updateLocation]);

  if (!isLoaded)
    return (
      <div className="mt-4 flex h-72 w-full items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        Loading map...
      </div>
    );

  return (
    <div className="relative mt-4 h-72 w-full overflow-visible rounded-xl">
      <div className="absolute left-3 right-3 top-3 z-10">
        <Autocomplete
          onLoad={(ac) => (autocompleteRef.current = ac)}
          onPlaceChanged={() => {
            const place = autocompleteRef.current?.getPlace();
            if (place?.geometry?.location) {
              const latVal = parseFloat(place.geometry.location.lat().toFixed(6));
              const lngVal = parseFloat(place.geometry.location.lng().toFixed(6));
              updateLocation(latVal, lngVal, {
                shouldNotify: true,
                searchLabel: place.formatted_address || place.name || "",
              });
            }
          }}
        >
          <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
            <MapPin className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "12px" }}
        center={pos || DEFAULT_CENTER}
        onLoad={(map) => {
          mapRef.current = map;
          map.setZoom(5);
          setMapReady(true);
        }}
        onClick={(e) => {
          if (e.latLng) {
            const latVal = parseFloat(e.latLng.lat().toFixed(6));
            const lngVal = parseFloat(e.latLng.lng().toFixed(6));
            updateLocation(latVal, lngVal, {
              shouldNotify: true,
              shouldReverseGeocode: true,
            });
          }
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        }}
      >
        {pos && (
          <Marker
            position={pos}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                const latVal = parseFloat(e.latLng.lat().toFixed(6));
                const lngVal = parseFloat(e.latLng.lng().toFixed(6));
                updateLocation(latVal, lngVal, {
                  shouldNotify: true,
                  shouldReverseGeocode: true,
                });
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapPicker;
