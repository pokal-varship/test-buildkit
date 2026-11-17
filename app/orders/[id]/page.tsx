import React from 'react'
import OrderDetailsContainer from '../OrderDetailsContainer'
import { notFound } from 'next/navigation'

// Helper function to validate order id pattern
function isValidOrderId(id: string): boolean {
    // Check if id is empty or undefined
    if (!id || typeof id !== 'string') {
        return false;
    }
    
    // Check if it contains dots (like com.chrome.devtools or file.json)
    if (id.includes('.')) {
        return false;
    }
    
    return true;
}

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  
  if (!isValidOrderId(id)) {
    notFound();
  }
  
  return (
    <OrderDetailsContainer />
  )
}

export default page