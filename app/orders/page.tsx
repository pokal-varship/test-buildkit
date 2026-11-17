import React from 'react'
import OrdersContainer from './OrdersContainer'

const OrdersPage = () => {
  return (
    <>
    <div className='md:hidden w-full h-full flex-1 flex flex-col'>
      <OrdersContainer />
    </div>
    </>
  );
}

export default OrdersPage;