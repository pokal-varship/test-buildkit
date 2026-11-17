"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ADDRESS_PIN_ICON } from "@config/Header/image.config";

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: ADDRESS_PIN_ICON,
    iconUrl: ADDRESS_PIN_ICON,
    shadowUrl: undefined,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

interface LocationMapProps {
    lat: number;
    lng: number;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng }) => {
    return (
        <>
            <MapContainer center={[lat, lng]} zoom={13} className="map-container-location">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
            <style>{`                
                .leaflet-control {
                    display: none !important;
                }      
                .map-container-location{
                    height: 100px;
                    width: 100%;
                }
                @media (max-width: 768px) {
                    .map-container-location{
                        height: 120px;
                    }
                }
    `}</style>
        </>
    );
};

export default LocationMap;