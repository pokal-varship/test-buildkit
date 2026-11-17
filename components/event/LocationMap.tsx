'use client';
import Icon from '@components/image/Icons';
import { EVENT_LOCATION_ICON, EVENT_MAP_LOCATION_ICON } from '@config/Header/image.config';
import React from 'react';
import { EventData } from '@components/type/event.type';
import { TranslationKeys, LanguageCode } from 'types';
import { useLang } from '@hooks/useLang';
import { useTheme } from 'context/ThemeProvider';
import CustomButton from '@components/buttons/Button';

const LocationMap = ({ eventData }: { eventData: EventData }) => {
  const lat = eventData.address.coordinates.latitude || 30.7333;
  const lng = eventData.address.coordinates.longitude || 76.7794;
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { theme } = useTheme();

  const embedURL = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const directionURL = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const {
    address,
    addressLine2,
    landmark,
    city,
    state,
    zipCode,
    country,
    unitNumber,
  } = eventData.address;

  const fullAddress = [
    address,
    addressLine2 || unitNumber,
    landmark,
    `${city}, ${state} ${zipCode}`,
    country,
  ]
    .filter(Boolean)
    .join(', ');


  return (
    <div className="location-map p-4 flex flex-col md:flex-row gap-4 bg-[var(--cards-containers)]">
      {/* Map Embed */}
      <iframe
        src={embedURL}
        width="100%"
        height="155"
        className="rounded-lg w-full md:w-1/2"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      {/* Address & Button */}
      <div className="flex flex-col md:w-1/2">
        <div className="info-section">
          <div className="info-item">
            <div className="flex items-center gap-1">
              <Icon icon={`${EVENT_LOCATION_ICON}#location-icon`} 
                color="var(--primary-color)" 
                width={16} 
                height={16} 
                className="icon-inline" 
                viewBox="0 0 24 24" 
                aria-label="Event Location Icon"
                aria-hidden="true"
              />
              <div className="info-label">{lang.address}</div>
            </div>
            <div className="info-value">{fullAddress}</div>
          </div>
        </div>
        <a href={directionURL} target="_blank" rel="noopener noreferrer" className="mt-4">
          <div className="directions-button">
            <CustomButton className="get-directions-btn">
              <Icon icon={`${EVENT_MAP_LOCATION_ICON}#map-location-icon`} 
                color="var(--black)" 
                width={16} 
                height={16} 
                className="direction-icon" 
                viewBox="0 0 24 24"
              />
              <span>{lang.getDirection}</span>
            </CustomButton>
          </div>
        </a>
      </div>
      <style>{`
        .location-map {
          border: ${theme === 'light' && '1px solid var(--primary-color)'};
          border-radius: 16px;
          padding: 16px;
          margin-top: 16px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default LocationMap;
