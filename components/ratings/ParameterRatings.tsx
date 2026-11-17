import React, { FC } from 'react';
import {  STAR_ICON_PDP } from '@config/Header/image.config';
import { getRatingBackgroundColor, getRatingBorderColor } from '@lib/helper/ratingColors';
import StarIcon from '@components/icons/Star';

interface ParameterRating {
  parameterName: string;
  avgRating: number;
}

interface ParameterRatingsProps {
  parameterAverages: ParameterRating[];
  showBottomBorder?: boolean;
}

const ParameterRatings: FC<ParameterRatingsProps> = ({
  parameterAverages,
  showBottomBorder = true,
}) => {
  if (!parameterAverages || parameterAverages.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-0 sm:gap-4 sm:px-0 pb-6 text-center text-xs${showBottomBorder ? ' border-b border-[var(--rating-border-primary)]' : ''}`}>
        {parameterAverages.map((item: ParameterRating, i: number) => (
          <div 
            key={i} 
            className="border rounded-lg py-2 px-3 sm:px-2 flex flex-col items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.04)] parameter-rating-container"
            style={{
              backgroundColor: getRatingBackgroundColor(item.avgRating),
              borderColor: getRatingBorderColor(item.avgRating)
            }}
          >
            <div className="inline-flex items-center gap-0.5 mb-1">
              <span className="parameter-rating text-lg font-bold text-[var(--primary-text)]">{item.avgRating}</span>
              <StarIcon height={'12'} width={'12'}/>
            </div>
            <div className="text-[var(--primary-text)] small-font font-medium text-center" title={item.parameterName}>{item.parameterName}</div>
          </div>
        ))}
      </div>

      <style>{`
        .parameter-rating {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          margin-right: 2px;
        }

        .parameter-rating-container {
          border-width: 1px;
          border-style: solid;
        }
      `}</style>
    </>
  );
};

export default ParameterRatings; 