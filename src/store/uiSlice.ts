import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastNotification {
    title: string;
    message: string;
    type?: 'success' | 'info' | 'error';
    duration?: number;
}

interface UiState {
    toast: ToastNotification | null;
}

const initialState: UiState = {
    toast: null,
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
    },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
