import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserData } from '../types';

interface UserState {
    user: UserData | null;
}

const initialState: UserState = {
    user: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserData>) {
            state.user = action.payload;
        },
        // other reducers...
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer; 