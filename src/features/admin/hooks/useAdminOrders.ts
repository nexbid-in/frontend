import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { AdminOrdersQueryDTO } from "../types";

export function useAdminOrdersQuery(query: AdminOrdersQueryDTO) {
    return useQuery({
        queryKey: QUERY_KEYS.admin.orders(query as unknown as Record<string, unknown>),
        queryFn: () => adminService.getOrders(query),
    });
}

export function useAdminOrderMetricsQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.admin.orderMetrics(),
        queryFn: () => adminService.getOrderMetrics(),
        refetchInterval: 15000,
    });
}

export function useAdminOrderDetailsQuery(orderId: string | null) {
    return useQuery({
        queryKey: orderId ? QUERY_KEYS.admin.orderDetails(orderId) : ["admin", "orders", "details", "none"],
        queryFn: () => (orderId ? adminService.getOrderDetails(orderId) : null),
        enabled: Boolean(orderId),
    });
}

export function useAdminCancelOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => adminService.cancelOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });
        },
    });
}
