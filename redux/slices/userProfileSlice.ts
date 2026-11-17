import { UserProfile } from '@components/type/store.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    profile: UserProfile | null;
}

const initialState: UserState = {
    profile: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserProfile(state, action: PayloadAction<UserProfile>) {
            state.profile = action.payload; // Set the user profile
        },
        clearUserProfile(state) {
            state.profile = null; // Clear the user profile
        },
    },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer; 