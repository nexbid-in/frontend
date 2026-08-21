import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: { id: string; email: string; firstName: string; lastName: string } | null;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isAuthLoading: true
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state, 
            action: PayloadAction<{ user: AuthState['user'] }>
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = true; 
            state.isAuthLoading = false;
        },
        
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAuthLoading = false;
        },

        setAuthFailed: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAuthLoading = false;
        }
    },
});

export const { setCredentials, logout, setAuthFailed } = authSlice.actions;

export default authSlice.reducer;
