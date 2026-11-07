import { useQuery } from "@tanstack/react-query";
import { fundsService } from "../services/fundsService";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useWalletOverview(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: QUERY_KEYS.wallet.overview(),
        queryFn: fundsService.getOverview,
        staleTime: 1000 * 30, // 30 seconds cache TTL to avoid redundant background fetches on navigation
        enabled: options?.enabled ?? true,
    });
}

