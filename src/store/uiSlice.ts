import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'dark' | 'light';

export interface ToastNotification {
    title: string;
    message: string;
    type?: 'success' | 'info' | 'error';
    duration?: number;
}

interface UiState {
    toast: ToastNotification | null;
    theme: Theme;
}

const getInitialTheme = (): Theme => {
    try {
        const saved = localStorage.getItem('nexbid_theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
    } catch {
        // Fallback if localStorage is restricted
    }
    return 'dark';
};

const initialState: UiState = {
    toast: null,
    theme: getInitialTheme(),
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showToast: (state, action: PayloadAction<ToastNotification>) => {
            state.toast = action.payload;
        },
        hideToast: (state) => {
            state.toast = null;
        },
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload;
            try {
                localStorage.setItem('nexbid_theme', action.payload);
            } catch {
                // Ignore storage write errors
            }
        },
    },
});

export const { showToast, hideToast, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
