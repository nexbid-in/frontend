import { useState, useEffect, useRef } from "react";
import {
    marketWebSocketService,
    type MarketTick,
} from "../services/marketWebSocketService";
import { getStockMarketQuote, type StockMarketQuote } from "../utils/stockPriceHelper";

export interface LiveQuote extends StockMarketQuote {
    flashDirection: "up" | "down" | null;
    atp?: number;
    bidPrice?: number | null;
    askPrice?: number | null;
    totalBuyQty?: number | null;
    totalSellQty?: number | null;
}

function getInitialQuote(symbol: string): LiveQuote {
    const cached = marketWebSocketService.getLatestTick(symbol);
    if (cached) {
        return {
            price: cached.ltp,
            change: cached.change,
            changePercent: cached.changePercent,
            isPositive: cached.change >= 0,
            flashDirection: null,
            atp: cached.atp,
            bidPrice: cached.bidPrice,
            askPrice: cached.askPrice,
            totalBuyQty: cached.totalBuyQty,
            totalSellQty: cached.totalSellQty,
        };
    }

    const baseline = getStockMarketQuote(symbol);
    return {
        ...baseline,
        flashDirection: null,
    };
}

/**
 * Custom hook that subscribes an individual stock symbol to live market ticks
 * from the shared singleton MarketWebSocketService.
 *
 * Architecture Highlights:
 * 1. Synchronous Cache / Baseline Initialization:
 *    Renders the latest cached tick immediately on mount (or falls back to baseline quote),
 *    preventing empty / layout shift states before WebSocket ticks arrive.
 * 2. Fine-grained Component-Scoped Re-rendering:
 *    Only re-renders the specific stock component when a tick for its symbol arrives.
 * 3. Directional Price Flash:
 *    Computes 'up' (green) or 'down' (red) based on previous price comparison,
 *    and auto-decays back to null after 400ms.
 * 4. Real-time Market Depth & ATP Streaming:
 *    Streams live Level-2 bid/ask, buy/sell volumes, and ATP directly into the quote state.
 */
export function useLiveStockQuote(symbol: string): LiveQuote {
    const cleanSymbol = symbol.toUpperCase().trim();

    const [prevSymbol, setPrevSymbol] = useState(cleanSymbol);
    const [quote, setQuote] = useState<LiveQuote>(() => getInitialQuote(cleanSymbol));

    // Official React pattern: adjust state during rendering when symbol prop changes
    if (prevSymbol !== cleanSymbol) {
        setPrevSymbol(cleanSymbol);
        setQuote(getInitialQuote(cleanSymbol));
    }

    const prevPriceRef = useRef<number | null>(null);
    const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Subscribe to live WebSocket updates for this symbol
        const unsubscribe = marketWebSocketService.subscribe(cleanSymbol, (tick: MarketTick) => {
            const currentPrice = tick.ltp;
            const prevPrice = prevPriceRef.current;

            let direction: "up" | "down" | null = null;
            if (prevPrice !== null) {
                if (currentPrice > prevPrice) {
                    direction = "up";
                } else if (currentPrice < prevPrice) {
                    direction = "down";
                }
            }

            prevPriceRef.current = currentPrice;

            setQuote((prev) => ({
                price: currentPrice,
                change: tick.change,
                changePercent: tick.changePercent,
                isPositive: tick.change >= 0,
                flashDirection: direction,
                atp: tick.atp ?? prev.atp,
                bidPrice: tick.bidPrice !== undefined ? tick.bidPrice : prev.bidPrice,
                askPrice: tick.askPrice !== undefined ? tick.askPrice : prev.askPrice,
                totalBuyQty: tick.totalBuyQty !== undefined ? tick.totalBuyQty : prev.totalBuyQty,
                totalSellQty: tick.totalSellQty !== undefined ? tick.totalSellQty : prev.totalSellQty,
            }));

            // Automatically decay flash direction back to normal after 400ms
            if (direction) {
                if (flashTimeoutRef.current) {
                    clearTimeout(flashTimeoutRef.current);
                }
                flashTimeoutRef.current = setTimeout(() => {
                    setQuote((prev) => ({ ...prev, flashDirection: null }));
                }, 400);
            }
        });

        return () => {
            unsubscribe();
            prevPriceRef.current = null;
            if (flashTimeoutRef.current) {
                clearTimeout(flashTimeoutRef.current);
            }
        };
    }, [cleanSymbol]);

    return quote;
}
