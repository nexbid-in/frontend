import type { Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback } from "@klinecharts/pro";
import type { KLineData } from "klinecharts";
import { env } from "@/config/env";
import { marketService } from "./marketService";
import { stockService } from "./stockService";
import { getStockMarketQuote } from "../utils/stockPriceHelper";

function getPeriodMs(period: Period): number {
    switch (period.timespan) {
        case "minute":
            return period.multiplier * 60 * 1000;
        case "hour":
            return period.multiplier * 60 * 60 * 1000;
        case "day":
            return period.multiplier * 24 * 60 * 60 * 1000;
        case "week":
            return period.multiplier * 7 * 24 * 60 * 60 * 1000;
        case "month":
            return period.multiplier * 30 * 24 * 60 * 60 * 1000;
        default:
            return 15 * 60 * 1000;
    }
}

function getResolutionFromPeriod(period: Period): string {
    switch (period.timespan) {
        case "minute":
            return String(period.multiplier);
        case "hour":
            return String(period.multiplier * 60);
        case "day":
            return "D";
        case "week":
            return "W";
        case "month":
            return "M";
        default:
            return "15";
    }
}

/**
 * Resolution-aware historical horizon matching TradingView and professional brokers.
 * Guarantees at least 2 full months (60 days) on 15m for technical analysis.
 */
function getHistoryLookbackMs(period: Period): number {
    const DAY_MS = 24 * 60 * 60 * 1000;
    switch (period.timespan) {
        case "minute":
            if (period.multiplier === 1) return 7 * DAY_MS;     // 1m  -> 7 days
            if (period.multiplier === 5) return 30 * DAY_MS;    // 5m  -> 30 days
            return 60 * DAY_MS;                                 // 15m -> 60 days (2 full months!)
        case "hour":
            return 180 * DAY_MS;                                // 1h  -> 180 days (6 months)
        case "day":
            return 365 * 2 * DAY_MS;                            // 1D  -> 2 years
        case "week":
            return 365 * 5 * DAY_MS;                            // 1W  -> 5 years
        case "month":
            return 365 * 10 * DAY_MS;                           // 1M  -> 10 years
        default:
            return 60 * DAY_MS;
    }
}

export type TickListener = (price: number, change: number, changePercent: number, ticker?: string) => void;

function createFallbackCandle(symbol: string, timestamp: number): KLineData {
    const quote = getStockMarketQuote(symbol);
    return {
        timestamp,
        open: quote.price,
        high: quote.price,
        low: quote.price,
        close: quote.price,
        volume: 1000,
        turnover: 1000 * quote.price,
    };
}

/**
 * Production-ready Realtime Datafeed for KLineChartPro.
 * Connects directly to Nexbid Backend REST API for historical OHLCV data
 * and streams live Indian Market (NSE) ticks via WebSocket Gateway.
 */
export class NexbidRealtimeDatafeed implements Datafeed {
    private ws: WebSocket | null = null;
    private reconnectTimeout: number | null = null;
    private currentCandle: KLineData | null = null;
    private activeSymbol: string | null = null;
    private activePeriod: Period | null = null;
    private activeCallback: DatafeedSubscribeCallback | null = null;
    private onTickCallback?: TickListener;

    constructor(onTick?: TickListener) {
        this.onTickCallback = onTick;
    }

    private ensureWebSocketConnection(): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const wsUrl = `${env.WS_URL}/ws/market-feed`;

        try {
            const socket = new WebSocket(wsUrl);
            this.ws = socket;

            socket.onopen = () => {
                if (this.activeSymbol && socket.readyState === WebSocket.OPEN) {
                    socket.send(
                        JSON.stringify({
                            action: "subscribe",
                            symbol: this.activeSymbol,
                        })
                    );
                }
            };

            socket.onmessage = (event: MessageEvent) => {
                this.handleWsMessage(event.data);
            };

            socket.onerror = (err) => {
                console.warn("[NexbidRealtimeDatafeed] WebSocket encountered an error:", err);
            };

            socket.onclose = () => {
                this.ws = null;

                // Reconnect with backoff if there is an active symbol subscription
                if (this.activeSymbol && !this.reconnectTimeout) {
                    this.reconnectTimeout = window.setTimeout(() => {
                        this.reconnectTimeout = null;
                        if (this.activeSymbol) {
                            this.ensureWebSocketConnection();
                        }
                    }, 2000);
                }
            };
        } catch (err) {
            console.warn("[NexbidRealtimeDatafeed] Failed to open WebSocket:", err);
        }
    }

    private handleWsMessage(raw: unknown): void {
        try {
            const text = typeof raw === "string" ? raw : String(raw);
            const payload = JSON.parse(text);

            if (
                payload?.type === "TICK" &&
                typeof payload.symbol === "string" &&
                payload.symbol.toUpperCase() === this.activeSymbol
            ) {
                const ltp = Number(payload.data?.ltp);
                if (isNaN(ltp) || ltp <= 0) return;

                const volume = Number(payload.data?.volume) || 10;
                const timestamp = Number(payload.data?.timestamp) || Date.now();
                const periodMs = this.activePeriod ? getPeriodMs(this.activePeriod) : 60000;
                const candleSlot = Math.floor(timestamp / periodMs) * periodMs;

                if (!this.currentCandle) {
                    this.currentCandle = {
                        timestamp: candleSlot,
                        open: ltp,
                        high: ltp,
                        low: ltp,
                        close: ltp,
                        volume,
                        turnover: volume * ltp,
                    };
                } else if (candleSlot > this.currentCandle.timestamp) {
                    // New bar period rolled over
                    this.currentCandle = {
                        timestamp: candleSlot,
                        open: this.currentCandle.close,
                        high: Math.max(this.currentCandle.close, ltp),
                        low: Math.min(this.currentCandle.close, ltp),
                        close: ltp,
                        volume,
                        turnover: volume * ltp,
                    };
                } else {
                    // Intra-bar live price update
                    this.currentCandle = {
                        ...this.currentCandle,
                        high: Math.max(this.currentCandle.high, ltp),
                        low: Math.min(this.currentCandle.low, ltp),
                        close: ltp,
                        volume: (this.currentCandle.volume ?? 0) + volume,
                        turnover: (this.currentCandle.turnover ?? 0) + volume * ltp,
                    };
                }

                // Push updated candlestick into KLineChartPro
                this.activeCallback?.(this.currentCandle);

                // Notify watchlist header and listeners of the live price
                if (this.onTickCallback) {
                    const change = typeof payload.change === "number" ? payload.change : 0;
                    const changePercent = typeof payload.changePercent === "number" ? payload.changePercent : 0;
                    this.onTickCallback(ltp, change, changePercent, this.activeSymbol ?? undefined);
                }
            }
        } catch (err) {
            console.warn("[NexbidRealtimeDatafeed] Malformed WS payload received:", err);
        }
    }

    async searchSymbols(search?: string): Promise<SymbolInfo[]> {
        const query = (search ?? "").trim().toUpperCase();

        try {
            const stocks = await stockService.searchStocks(query, 20);
            if (stocks && stocks.length > 0) {
                return stocks.map((s) => ({
                    ticker: s.symbol,
                    name: s.name,
                    shortName: s.symbol,
                    exchange: s.exchange,
                    market: s.type === "INDEX" ? "indices" : "stocks",
                    priceCurrency: "INR",
                    type: s.type === "INDEX" ? "index" : "stock",
                }));
            }
        } catch (err) {
            console.warn("[NexbidRealtimeDatafeed] Failed to search stocks from backend:", err);
        }

        const defaultSymbols: SymbolInfo[] = [
            { ticker: "NIFTY 50", name: "Nifty 50 Index", shortName: "NIFTY", exchange: "NSE", market: "indices", priceCurrency: "INR", type: "index" },
            { ticker: "BANKNIFTY", name: "Nifty Bank Index", shortName: "BANKNIFTY", exchange: "NSE", market: "indices", priceCurrency: "INR", type: "index" },
            { ticker: "TATAMOTORS", name: "Tata Motors Limited", shortName: "TATAMOTORS", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
            { ticker: "INFY", name: "Infosys Limited", shortName: "INFY", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
            { ticker: "TATASTEEL", name: "Tata Steel Limited", shortName: "TATASTEEL", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
            { ticker: "RELIANCE", name: "Reliance Industries", shortName: "RELIANCE", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
            { ticker: "HDFCBANK", name: "HDFC Bank Limited", shortName: "HDFCBANK", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
            { ticker: "HEROMOTOCO", name: "Hero MotoCorp Limited", shortName: "HEROMOTOCO", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
            { ticker: "JSWSTEEL", name: "JSW Steel Limited", shortName: "JSWSTEEL", exchange: "NSE", market: "stocks", priceCurrency: "INR", type: "stock" },
        ];

        if (!query) {
            return defaultSymbols;
        }

        return defaultSymbols.filter(
            (s) => s.ticker.includes(query) || (s.name && s.name.toUpperCase().includes(query))
        );
    }

    async getHistoryKLineData(symbol: SymbolInfo, period: Period, from?: number, to?: number): Promise<KLineData[]> {
        const resolution = getResolutionFromPeriod(period);
        const periodMs = getPeriodMs(period);
        const lookbackMs = getHistoryLookbackMs(period);
        const now = Date.now();
        const alignedNow = Math.floor(now / periodMs) * periodMs;

        const targetTo = typeof to === "number" && to > 0 ? Math.min(to, alignedNow) : alignedNow;
        const targetFrom = typeof from === "number" && from > 0 && from < targetTo
            ? from
            : targetTo - lookbackMs;

        try {
            const candles = await marketService.getHistoricalCandles({
                symbol: symbol.ticker,
                resolution,
                from: targetFrom,
                to: targetTo,
            });

            if (candles && candles.length > 0) {
                // Ensure strict ascending order for KLineChart
                candles.sort((a, b) => a.timestamp - b.timestamp);
                this.currentCandle = { ...candles[candles.length - 1] };
                return candles;
            }
        } catch (err) {
            console.warn(`[NexbidRealtimeDatafeed] Error fetching historical candles for ${symbol.ticker}:`, err);
        }

        // Fallback baseline candle in case of empty history
        const fallback = createFallbackCandle(symbol.ticker, alignedNow);
        this.currentCandle = { ...fallback };
        return [fallback];
    }

    subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
        const sym = symbol.ticker.toUpperCase().trim();
        const prevSymbol = this.activeSymbol;

        this.activeSymbol = sym;
        this.activePeriod = period;
        this.activeCallback = callback;

        this.ensureWebSocketConnection();

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (prevSymbol && prevSymbol !== sym) {
                this.ws.send(
                    JSON.stringify({
                        action: "unsubscribe",
                        symbol: prevSymbol,
                    })
                );
            }
            this.ws.send(
                JSON.stringify({
                    action: "subscribe",
                    symbol: sym,
                })
            );
        }
    }

    unsubscribe(symbol?: SymbolInfo, period?: Period): void {
        void period;
        const sym = symbol?.ticker?.toUpperCase()?.trim() || this.activeSymbol;

        if (sym && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                JSON.stringify({
                    action: "unsubscribe",
                    symbol: sym,
                })
            );
        }

        if (this.activeSymbol === sym) {
            this.activeCallback = null;
            this.currentCandle = null;
        }
    }

    destroy(): void {
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.activeSymbol && this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(
                    JSON.stringify({
                        action: "unsubscribe",
                        symbol: this.activeSymbol,
                    })
                );
            } catch {
                // Ignore socket errors on destroy
            }
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.activeSymbol = null;
        this.activeCallback = null;
        this.currentCandle = null;
    }
}
