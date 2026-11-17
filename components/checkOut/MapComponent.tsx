import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  coords: [number, number];
  place: string;
}

function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.setView(coords, 13);
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ coords, place }) => {
  return (
    <MapContainer center={coords} zoom={13} style={{ height: '500px', width: '100%', marginTop: 20 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker position={coords}>
        <Popup>{place || 'Selected Location'}</Popup>
      </Marker>
      <ChangeMapView coords={coords} />
    </MapContainer>
  );
};

export default MapComponent; 