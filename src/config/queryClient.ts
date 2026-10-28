import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
            gcTime: 1000 * 60 * 10, // Garbage collection cache persists for 10 minutes
            refetchOnWindowFocus: true, // Automatically synchronize when user returns to window
            retry: 1,
        },
    },
});
