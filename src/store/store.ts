import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import authReducer, { logout, setAuthFailed, setAccountBlocked } from '@/features/auth/store/authSlice';
import uiReducer from '@/store/uiSlice';
import { queryClient } from '@/config/queryClient';
import { marketWebSocketService } from '@/features/watchlist/services/marketWebSocketService';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
    actionCreator: logout,
    effect: () => {
        queryClient.clear();
        marketWebSocketService.reset();
    },
});

listenerMiddleware.startListening({
    actionCreator: setAuthFailed,
    effect: () => {
        queryClient.clear();
        marketWebSocketService.reset();
    },
});

listenerMiddleware.startListening({
    actionCreator: setAccountBlocked,
    effect: () => {
        queryClient.clear();
        marketWebSocketService.reset();
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

