import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminStockService } from "../services/adminStockService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type {
    AdminStocksQuery,
    CreateStockInput,
    UpdateStockInput,
    UpdateStockStatusInput,
    AdminStockItem,
} from "@/types/adminStock";

export function useAdminStocksQuery(query: AdminStocksQuery) {
    return useQuery({
        queryKey: QUERY_KEYS.admin.stocks(query as unknown as Record<string, unknown>),
        queryFn: () => adminStockService.getAdminStocks(query),
        placeholderData: keepPreviousData,
    });
}

export function useCreateStockMutation(options?: {
    onSuccess?: (stock: AdminStockItem) => void;
    onError?: (error: Error) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateStockInput) => adminStockService.createStock(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "stocks"] });
            options?.onSuccess?.(data);
        },
        onError: (err: Error) => {
            options?.onError?.(err);
        },
    });
}

export function useUpdateStockStatusMutation(options?: {
    onSuccess?: (stock: AdminStockItem) => void;
    onError?: (error: Error) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stockId, payload }: { stockId: string; payload: UpdateStockStatusInput }) =>
            adminStockService.updateStockStatus(stockId, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "stocks"] });
            options?.onSuccess?.(data);
        },
        onError: (err: Error) => {
            options?.onError?.(err);
        },
    });
}

export function useUpdateStockMutation(options?: {
    onSuccess?: (stock: AdminStockItem) => void;
    onError?: (error: Error) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stockId, payload }: { stockId: string; payload: UpdateStockInput }) =>
            adminStockService.updateStock(stockId, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "stocks"] });
            options?.onSuccess?.(data);
        },
        onError: (err: Error) => {
            options?.onError?.(err);
        },
    });
}

export function useDeleteStockMutation(options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (stockId: string) => adminStockService.deleteStock(stockId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "stocks"] });
            options?.onSuccess?.();
        },
        onError: (err: Error) => {
            options?.onError?.(err);
        },
    });
}
