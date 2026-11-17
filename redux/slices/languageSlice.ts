import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

interface LanguageState {
  language: string;
}

const initialState: LanguageState = {
  language: 'en', // Default language
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

export const useLanguageStore = () => {
  return useSelector((state: { language: LanguageState }) => state.language.language);
};