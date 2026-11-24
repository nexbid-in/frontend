import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDashboardOverviewQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.dashboard.overview(),
        queryFn: () => dashboardService.getOverview(),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 5,
        refetchOnMount: "always",
    });
}
