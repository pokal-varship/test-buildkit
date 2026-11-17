import Shimmer from '@components/ui/Shimmer';
import React from 'react'

const OrderTileSkeleton = () => {
  return (
    <div className='flex gap-3 p-3 mx-3 mb-3 border border-[var(--borders-dividers)] rounded-lg mt-3'>
      <Shimmer  height={74} width={74}  />
      <div className='w-full flex flex-col gap-y-2'>
        <div className='flex gap-x-2 justify-between'>
        <Shimmer height={20} width={"50%"} />
        <Shimmer height={20} width={"25%"} />
        </div>
        <Shimmer height={20} width={"100%"} />
        <Shimmer height={20} width={"80%"} />
      </div>
    </div>
  );
}

export default OrderTileSkeleton;