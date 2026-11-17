import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PageConfig {
  title: string;
  description: string;
}

interface HomePageState {
  pageConfig: PageConfig;
  storeData: any | null;
  configData: any | null;
  pageConfigData: any | null;
  loading: boolean;
  configLoading: boolean;
  error: string | null;
  configError: string | null;
  lastUpdated: number | null; // Track when data was last fetched
}

const initialState: HomePageState = {
  pageConfig: {
    title: 'Home Page',
    description: 'Welcome to the home page!',
  },
  storeData: null,
  configData: null,
  pageConfigData: null,
  loading: true,
  configLoading: false,
  error: null,
  configError: null,
  lastUpdated: null,
};

const homePageSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    setPageConfig: (state, action: PayloadAction<PageConfig>) => {
      state.pageConfig = action.payload;
    },
    setStoreData: (state, action: PayloadAction<any>) => {
      state.storeData = action.payload;
      state.error = null; // Clear errors when data is successfully fetched
      state.lastUpdated = Date.now(); // Track when data was updated
    },
    setConfigData: (state, action: PayloadAction<any>) => {
      state.configData = action.payload;
      state.configError = null; // Clear errors when data is successfully fetched
    },
    setPageConfigData: (state, action: PayloadAction<any>) => {
      state.pageConfigData = action.payload;
      state.configError = null; // Clear errors when data is successfully fetched
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setConfigLoading: (state, action: PayloadAction<boolean>) => {
      state.configLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      // Clear lastUpdated timestamp on error to force refresh
      if (action.payload) {
        state.lastUpdated = null;
      }
    },
    setConfigError: (state, action: PayloadAction<string | null>) => {
      state.configError = action.payload;
      if (action.payload) {
        state.configData = null; // Clear config data on error
      }
    },
  },
});

export const {
  setPageConfig,
  setStoreData,
  setConfigData,
  setPageConfigData,
  setLoading,
  setConfigLoading,
  setError,
  setConfigError
} = homePageSlice.actions;

export default homePageSlice.reducer;
