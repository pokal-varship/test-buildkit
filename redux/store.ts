import { configureStore } from '@reduxjs/toolkit';
import homePageReducer from './slices/homePageSlice';
import storeReducer from './slices/storeSlice';
import userReducer from './slices/userProfileSlice';
import languageReducer from './slices/languageSlice';
import locationReducer from './slices/locationSlice';
import productViewReducer from './slices/productViewSlice';
import productSearchReducer from './slices/productSearchSlice';
import pdpProductReducer from './slices/pdpProductSlice';
import cartReducer from './slices/cartSlice';
import addressReducer from './slices/addressSlice';
import ordersReducer from './slices/ordersSlice';
import userAddressReducer from './slices/userAddressSlice';
import productReviewReducer from './slices/productReviewSlice';
import wishlistReducer from './slices/wishlistSlice';
import comboReducer from './slices/comboSlice';
import reorderReducer from './slices/reorderSlice';
import qrFlowReducer from './slices/qrFlowSlice';
import qrEventsReducer from './slices/qrEvents';
import walletReducer from './slices/walletSlice';
const store = configureStore({
  reducer: {
    homePage: homePageReducer,
    store: storeReducer,
    user: userReducer,
    language: languageReducer,
    location: locationReducer,
    productView: productViewReducer,
    productSearch: productSearchReducer,
    pdpProduct: pdpProductReducer,
    cart: cartReducer,
    address: addressReducer,
    orders: ordersReducer,
    userAddress: userAddressReducer,
    productReviews: productReviewReducer,
    wishlist: wishlistReducer,
    combo: comboReducer,
    reorder: reorderReducer,
    qrFlow: qrFlowReducer,
    qrEvents: qrEventsReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
