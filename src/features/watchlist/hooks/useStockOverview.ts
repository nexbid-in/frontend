import { useQuery } from "@tanstack/react-query";
import { marketService } from "../services/marketService";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useStockOverviewQuery(symbol: string) {
    const cleanSymbol = symbol.toUpperCase().trim();

    return useQuery({
        queryKey: QUERY_KEYS.market.overview(cleanSymbol),
        queryFn: () => marketService.getStockOverview(cleanSymbol),
        enabled: Boolean(cleanSymbol),
        staleTime: 1000 * 30, // 30 seconds fresh cache
        refetchOnWindowFocus: false,
    });
}

