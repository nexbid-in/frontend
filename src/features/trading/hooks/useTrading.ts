import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradingService } from "../services/tradingService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAppDispatch } from "@/store/hooks";
import { showToast } from "@/store/uiSlice";
import type {
    PlaceOrderRequestDTO,
    OrderStatus,
    PositionsFilter,
} from "../types";
import { AxiosError } from "axios";

function extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AxiosError) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error?.message ||
            error.message ||
            fallback
        );
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
}

export function useOrdersQuery(status?: OrderStatus) {
    return useQuery({
        queryKey: QUERY_KEYS.orders.list(status),
        queryFn: () => tradingService.getOrders(status),
        staleTime: 1000 * 5,
        refetchInterval: (query) => {
            const hasPending = query.state.data?.some((o) => o.status === "PENDING");
            return hasPending ? 3000 : false;
        },
    });
}

export function usePositionsQuery(filter: PositionsFilter = "OPEN") {
    return useQuery({
        queryKey: QUERY_KEYS.portfolio.positions(filter),
        queryFn: () => tradingService.getPositions(filter),
        staleTime: 1000 * 5,
    });
}

export function useMarketStatusQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.orders.marketStatus(),
        queryFn: () => tradingService.getMarketStatus(),
        staleTime: 1000 * 30,
        refetchInterval: 1000 * 30,
    });
}

export function usePlaceOrderMutation() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (data: PlaceOrderRequestDTO) => tradingService.placeOrder(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.portfolio.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet.all });

            const isAmo = Boolean(data.isAmo);
            const statusText = isAmo
                ? "placed as After Market Order (AMO) — queued for market open at 09:15 AM IST"
                : data.status === "EXECUTED"
                ? "executed immediately"
                : data.status === "PENDING"
                ? "placed as pending"
                : "submitted";

            dispatch(
                showToast({
                    type: "success",
                    title: isAmo ? `${data.side} AMO Placed` : `${data.side} Order Placed`,
                    message: `${data.quantity} qty of ${data.symbol} (${data.orderType} • ${data.productType}) ${statusText}.`,
                })
            );
        },
        onError: (error) => {
            const message = extractErrorMessage(error, "Failed to place order.");
            dispatch(
                showToast({
                    type: "error",
                    title: "Order Placement Failed",
                    message,
                })
            );
        },
    });
}

export function useCancelOrderMutation() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (orderId: string) => tradingService.cancelOrder(orderId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet.all });

            dispatch(
                showToast({
                    type: "success",
                    title: "Order Cancelled",
                    message: `Pending order for ${data.quantity} qty of ${data.symbol} cancelled successfully.`,
                })
            );
        },
        onError: (error) => {
            const message = extractErrorMessage(error, "Failed to cancel order.");
            dispatch(
                showToast({
                    type: "error",
                    title: "Cancellation Failed",
                    message,
                })
            );
        },
    });
}

export function useSquareOffPositionMutation() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (positionId: string) => tradingService.squareOffPosition(positionId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.portfolio.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet.all });

            dispatch(
                showToast({
                    type: "success",
                    title: "Position Squared Off",
                    message: `Position in ${data.symbol} (${data.productType}) exited at market price.`,
                })
            );
        },
        onError: (error) => {
            const message = extractErrorMessage(error, "Failed to square off position.");
            dispatch(
                showToast({
                    type: "error",
                    title: "Square Off Failed",
                    message,
                })
            );
        },
    });
}

