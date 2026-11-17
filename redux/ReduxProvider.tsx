'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Store } from "@components/type/store.types";
interface StoreDataResponse {
  data: Store[]
}
const ReduxProvider: React.FC<{ children: React.ReactNode, storePropsData: StoreDataResponse }> = ({ children, storePropsData }) => {
    return <Provider store={store} serverState={{...store.getState(), homePage: {...store.getState()?.homePage, storeData: storePropsData}}}>{children}</Provider>;
};

export default ReduxProvider; 
