import Shimmer from '@components/ui/Shimmer'
import React from 'react'

const OrderDetailsContainerSkeleton = () => {
  return (
    <div className="w-full p-4">
      <div className="w-full mb-4 flex flex-col gap-y-2 p-3 border border-[var(--borders-dividers)] rounded-lg">
        <div className="w-full flex justify-between ">
          <Shimmer height={20} width={"50%"} />
          <Shimmer height={20} width={"20%"} />
        </div>
        <Shimmer height={20} width={"70%"} />
        <Shimmer height={20} width={"50%"} />
      </div>
      <div className='w-full flex flex-col gap-y-4'>
        {[...Array(3)].map((_, index) => (
          <Shimmer key={index} height={100} width={"100%"} />
        ))}
      </div>
    </div>
  );
}

export default OrderDetailsContainerSkeleton