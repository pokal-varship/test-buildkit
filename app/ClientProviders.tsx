"use client";

import React from "react";
import { Store } from "@components/type/store.types";
import ConditionalLocationProvider from "@components/provider/ConditionalLocationProvider";
import AddressProvider from "@components/provider/AddressProvider";
import { QRProvider } from "@components/provider/QRProvider";

interface StoreDataResponse {
  data: Store[];
}

export default function ClientProviders({
  children,
  storePropsData,
}: {
  children: React.ReactNode;
  storePropsData: StoreDataResponse;
}) {
  return (
    <ConditionalLocationProvider>
      <AddressProvider storePropsData={storePropsData}>
        <QRProvider>{children}</QRProvider>
      </AddressProvider>
    </ConditionalLocationProvider>
  );
}
