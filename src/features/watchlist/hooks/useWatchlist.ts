import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { watchlistService } from "../services/watchlistService";
import { stockService } from "../services/stockService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAppDispatch } from "@/store/hooks";
import { showToast } from "@/store/uiSlice";
import type { SearchStocksResponseDTO } from "../types";

export function useWatchlistQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.watchlist.user(),
        queryFn: watchlistService.getWatchlist,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false, // Live ticks stream via WebSocket; avoid redundant REST refetches on tab switch
    });
}

export function useStockSearchQuery(debouncedQuery: string) {
    const trimmed = debouncedQuery.trim();
    return useQuery({
        queryKey: QUERY_KEYS.stocks.search(trimmed),
        queryFn: () => stockService.searchStocks(trimmed),
        enabled: trimmed.length > 0,
        staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    });
}

export function useInfiniteStockSearchQuery(
    query: string = "",
    type: "ALL" | "EQUITY" | "INDEX" = "ALL",
    limit: number = 20
) {
    const trimmed = query.trim();

    return useInfiniteQuery<SearchStocksResponseDTO>({
        queryKey: QUERY_KEYS.stocks.infinite({ query: trimmed, type }),
        queryFn: ({ pageParam = 1 }) =>
            stockService.searchInstruments({
                query: trimmed,
                type,
                page: pageParam as number,
                limit,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.hasMore) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchlist.all });
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
