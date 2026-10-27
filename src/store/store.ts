import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import authReducer, { logout, setAuthFailed, setAccountBlocked } from '@/features/auth/store/authSlice';
import uiReducer from '@/store/uiSlice';
import { queryClient } from '@/config/queryClient';

const listenerMiddleware = createListenerMiddleware();

// Automated session boundary cache cleanup for Fintech security
listenerMiddleware.startListening({
    actionCreator: logout,
    effect: () => {
        queryClient.clear();
    },
});

listenerMiddleware.startListening({
    actionCreator: setAuthFailed,
    effect: () => {
        queryClient.clear();
    },
});

listenerMiddleware.startListening({
    actionCreator: setAccountBlocked,
    effect: () => {
        queryClient.clear();
    },
});

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

