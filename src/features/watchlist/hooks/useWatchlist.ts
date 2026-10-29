import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { watchlistService } from "../services/watchlistService";
import { stockService } from "../services/stockService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAppDispatch } from "@/store/hooks";
import { showToast } from "@/store/uiSlice";

/**
 * Hook to retrieve the user's watchlist with auto-caching.
 */
export function useWatchlistQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.watchlist.user(),
        queryFn: watchlistService.getWatchlist,
    });
}

/**
 * Hook to search stocks with dynamic enabled condition.
 */
export function useStockSearchQuery(debouncedQuery: string) {
    const trimmed = debouncedQuery.trim();
    return useQuery({
        queryKey: QUERY_KEYS.stocks.search(trimmed),
        queryFn: () => stockService.searchStocks(trimmed),
        enabled: trimmed.length > 0,
        staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    });
}

/**
 * Hook to add a stock to the user's watchlist.
 * Automatically invalidates and refetches the watchlist on success.
 */
export function useAddToWatchlistMutation() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (stockId: string) => watchlistService.addToWatchlist(stockId),
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchlist.all });
            dispatch(
                showToast({
                    type: "success",
                    title: "Added to Watchlist",
                    message: `${newItem.stock.symbol} added to your watchlist.`,
                    duration: 3000,
                })
            );
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "Failed to add stock to watchlist.";
            dispatch(
                showToast({
                    type: "error",
                    title: "Action Failed",
                    message,
                })
            );
        },
    });
}

/**
 * Hook to remove a stock from the user's watchlist.
 * Automatically invalidates and refetches the watchlist on success.
 */
export function useRemoveFromWatchlistMutation() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (stockId: string) => watchlistService.removeFromWatchlist(stockId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchlist.all });
            dispatch(
                showToast({
                    type: "success",
                    title: "Removed from Watchlist",
                    message: "Stock removed from your watchlist.",
                    duration: 3000,
                })
            );
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "Failed to remove stock from watchlist.";
            dispatch(
                showToast({
                    type: "error",
                    title: "Action Failed",
                    message,
                })
            );
        },
    });
}
