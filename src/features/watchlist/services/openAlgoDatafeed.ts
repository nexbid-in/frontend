import type {
    DataFeed,
    BarsRequest,
    Bar,
    UnsubscribeFn,
    SymbolSearchRequest,
    SymbolMatch,
    LiveBarMeta,
} from "openalgo-charts";
import { marketService } from "./marketService";
import { stockService } from "./stockService";
import { getStockMarketQuote } from "../utils/stockPriceHelper";
import { env } from "@/config/env";

export type TickListener = (
    price: number,
    change: number,
    changePercent: number,
    ticker?: string
) => void;

interface ActiveSubscription {
    symbol: string;
    intervalSec: number;
    onBar: (bar: Bar, meta?: LiveBarMeta) => void;
    currentBar: Bar | null;
}

/**
 * Translates OpenAlgo interval tokens (e.g., '1m', '5m', '15m', '1h', '1d', '1w')
 * into the resolution strings expected by the Nexbid backend.
 */
export function intervalToResolution(interval: string): string {
    const norm = interval.toLowerCase().trim();
    if (norm === "1m" || norm === "1") return "1";
    if (norm === "5m" || norm === "5") return "5";
    if (norm === "15m" || norm === "15") return "15";
    if (norm === "30m" || norm === "30") return "30";
    if (norm === "1h" || norm === "60m" || norm === "60") return "60";
    if (norm === "1d" || norm === "d") return "D";
    if (norm === "1w" || norm === "w") return "W";
    if (norm === "1mo" || norm === "m") return "M";
    return "15";
}

/**
 * Returns bucket duration in seconds for candle aggregation.
 */
export function intervalToSeconds(interval: string): number {
    const norm = interval.toLowerCase().trim();
    if (norm === "1m" || norm === "1") return 60;
    if (norm === "5m" || norm === "5") return 300;
    if (norm === "15m" || norm === "15") return 900;
    if (norm === "30m" || norm === "30") return 1800;
    if (norm === "1h" || norm === "60m" || norm === "60") return 3600;
    if (norm === "1d" || norm === "d") return 86400;
    if (norm === "1w" || norm === "w") return 86400 * 7;
    if (norm === "1mo" || norm === "m") return 86400 * 30;
    return 900;
}

/**
 * Adequate history lookback window in milliseconds so 200+ bars are loaded
 * for indicators (such as 200 EMA, Supertrend, Bollinger Bands) to compute cleanly.
 */
export function getHistoryLookbackMs(interval: string): number {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const norm = interval.toLowerCase().trim();
    if (norm === "1m" || norm === "1") return 5 * DAY_MS;       // ~1,800 bars
    if (norm === "5m" || norm === "5") return 20 * DAY_MS;      // ~1,500 bars
    if (norm === "15m" || norm === "15") return 60 * DAY_MS;    // ~1,500 bars (2 full months)
    if (norm === "30m" || norm === "30") return 90 * DAY_MS;    // ~1,100 bars
    if (norm === "1h" || norm === "60m" || norm === "60") return 180 * DAY_MS; // ~1,100 bars (6 months)
    if (norm === "1d" || norm === "d") return 365 * 2 * DAY_MS; // ~500 bars (2 years)
    if (norm === "1w" || norm === "w") return 365 * 5 * DAY_MS; // ~260 bars (5 years)
    return 60 * DAY_MS;
}

const DEFAULT_POPULAR_SYMBOLS: SymbolMatch[] = [
    { symbol: "RELIANCE", exchange: "NSE", name: "Reliance Industries", assetClass: "Stock" },
    { symbol: "TCS", exchange: "NSE", name: "Tata Consultancy Services", assetClass: "Stock" },
    { symbol: "INFY", exchange: "NSE", name: "Infosys Limited", assetClass: "Stock" },
    { symbol: "HDFCBANK", exchange: "NSE", name: "HDFC Bank Limited", assetClass: "Stock" },
    { symbol: "TATAMOTORS", exchange: "NSE", name: "Tata Motors Limited", assetClass: "Stock" },
    { symbol: "TATASTEEL", exchange: "NSE", name: "Tata Steel Limited", assetClass: "Stock" },
    { symbol: "NIFTY 50", exchange: "NSE", name: "Nifty 50 Index", assetClass: "Index" },
    { symbol: "BANKNIFTY", exchange: "NSE", name: "Nifty Bank Index", assetClass: "Index" },
];

/**
 * Production-ready OpenAlgo Charts DataFeed implementation for Nexbid.
 * - Fetches historical OHLCV data from Nexbid Backend REST API
 * - Normalizes timestamps to UTC seconds integer standard
 * - Handles live tick streaming & candle forming over WebSocket
 * - Integrates native Symbol Search against Nexbid's stock database
 */
export class NexbidOpenAlgoDataFeed implements DataFeed {
    private ws: WebSocket | null = null;
    private reconnectTimeout: number | null = null;
    private isDestroyed = false;
    private subscribers = new Map<string, ActiveSubscription>();
    private onTickCallback?: TickListener;

    constructor(onTick?: TickListener) {
        this.onTickCallback = onTick;
    }

    public setOnTickCallback(cb?: TickListener): void {
        this.onTickCallback = cb;
    }

    /**
     * Historical Bars Loader contract required by OpenAlgo Charts.
     */
    async getBars(req: BarsRequest): Promise<Bar[]> {
        const symbol = req.symbol.toUpperCase().trim();
        const resolution = intervalToResolution(req.interval);
        const intervalSec = intervalToSeconds(req.interval);
        const lookbackMs = getHistoryLookbackMs(req.interval);

        const nowMs = Date.now();
        const alignedNowMs = Math.floor(nowMs / (intervalSec * 1000)) * (intervalSec * 1000);

        const targetToMs =
            typeof req.to === "number" && req.to > 0 ? req.to * 1000 : alignedNowMs;

        const targetFromMs =
            typeof req.from === "number" && req.from > 0 && req.from * 1000 < targetToMs
                ? req.from * 1000
                : targetToMs - lookbackMs;

        try {
            const rawCandles = await marketService.getHistoricalCandles({
                symbol,
                resolution,
                from: targetFromMs,
                to: targetToMs,
            });

            if (rawCandles && rawCandles.length > 0) {
                // Convert candles to OpenAlgo Bar format (time in UTC seconds)
                const bars: Bar[] = rawCandles.map((c) => ({
                    time: c.timestamp > 1e11 ? Math.floor(c.timestamp / 1000) : c.timestamp,
                    open: Number(c.open),
                    high: Number(c.high),
                    low: Number(c.low),
                    close: Number(c.close),
                    volume: typeof c.volume === "number" ? Number(c.volume) : undefined,
                }));

                // Strict ascending timestamp order
                bars.sort((a, b) => a.time - b.time);

                // Deduplicate consecutive bars with identical timestamps
                const uniqueBars: Bar[] = [];
                for (const bar of bars) {
                    if (uniqueBars.length > 0 && uniqueBars[uniqueBars.length - 1].time === bar.time) {
                        uniqueBars[uniqueBars.length - 1] = bar;
                    } else {
                        uniqueBars.push(bar);
                    }
                }

                if (uniqueBars.length > 0) {
                    // Seed the active subscription's forming bar if one exists
                    const subKeyPrefix = `${symbol}_`;
                    for (const [key, sub] of this.subscribers.entries()) {
                        if (key.startsWith(subKeyPrefix)) {
                            sub.currentBar = { ...uniqueBars[uniqueBars.length - 1] };
                        }
                    }
                    return uniqueBars;
                }
            }
        } catch (err) {
            console.warn(`[NexbidOpenAlgoDataFeed] Error fetching history for ${symbol}:`, err);
        }

        // Fallback baseline candle in case the backend returns empty data
        const quote = getStockMarketQuote(symbol);
        const fallbackTime = Math.floor(alignedNowMs / 1000);
        const fallbackBar: Bar = {
            time: fallbackTime,
            open: quote.price,
            high: quote.price,
            low: quote.price,
            close: quote.price,
            volume: 1000,
        };

        return [fallbackBar];
    }

    /**
     * Real-time Bar Streaming subscription contract required by OpenAlgo Charts.
     */
    subscribeBars(
        req: BarsRequest,
        onBar: (bar: Bar, meta?: LiveBarMeta) => void
    ): UnsubscribeFn {
        const symbol = req.symbol.toUpperCase().trim();
        const intervalSec = intervalToSeconds(req.interval);
        const subKey = `${symbol}_${req.interval}`;

        const subscription: ActiveSubscription = {
            symbol,
            intervalSec,
            onBar,
            currentBar: null,
        };

        this.subscribers.set(subKey, subscription);

        // Ensure WebSocket is open and subscribed
        this.ensureWebSocketConnection();
        this.sendWsSubscription(symbol);

        return () => {
            this.subscribers.delete(subKey);
            const hasOtherSubsForSymbol = Array.from(this.subscribers.values()).some(
                (s) => s.symbol === symbol
            );
            if (!hasOtherSubsForSymbol) {
                this.sendWsUnsubscription(symbol);
            }
        };
    }

    /**
     * Symbol Search provider contract invoked by OpenAlgo Charts Widget topbar.
     */
    async searchSymbols(request: SymbolSearchRequest): Promise<SymbolMatch[]> {
        const query = (request.query || "").trim().toUpperCase();

        try {
            const stocks = await stockService.searchStocks(query, 20);
            if (stocks && stocks.length > 0) {
                return stocks.map((s) => ({
                    symbol: s.symbol,
                    exchange: s.exchange || "NSE",
                    name: s.name,
                    assetClass: s.type === "INDEX" ? "Index" : "Stock",
                }));
            }
        } catch (err) {
            console.warn("[NexbidOpenAlgoDataFeed] searchStocks error:", err);
        }

        if (!query) {
            return DEFAULT_POPULAR_SYMBOLS;
        }

        return DEFAULT_POPULAR_SYMBOLS.filter(
            (s) => s.symbol.includes(query) || (s.name && s.name.toUpperCase().includes(query))
        );
    }

    // ==========================================
    // Internal WebSocket & Live Tick Handling
    // ==========================================

    private ensureWebSocketConnection(): void {
        if (this.isDestroyed) return;
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const wsUrl = `${env.WS_URL}/ws/market-feed`;

        try {
            const socket = new WebSocket(wsUrl);
            this.ws = socket;

            socket.onopen = () => {
                if (this.isDestroyed) {
                    socket.close();
                    return;
                }
                // Resubscribe to all active unique symbols upon open
                const uniqueSymbols = new Set(
                    Array.from(this.subscribers.values()).map((s) => s.symbol)
                );
                uniqueSymbols.forEach((sym) => this.sendWsSubscription(sym));
            };

            socket.onmessage = (event: MessageEvent) => {
                this.handleWsMessage(event.data);
            };

            socket.onerror = (err) => {
                console.warn("[NexbidOpenAlgoDataFeed] WebSocket error:", err);
            };

            socket.onclose = () => {
                this.ws = null;
                if (!this.isDestroyed && this.subscribers.size > 0 && !this.reconnectTimeout) {
                    this.reconnectTimeout = window.setTimeout(() => {
                        this.reconnectTimeout = null;
                        this.ensureWebSocketConnection();
                    }, 2000);
                }
            };
        } catch (err) {
            console.warn("[NexbidOpenAlgoDataFeed] Failed to open WebSocket:", err);
        }
    }

    private sendWsSubscription(symbol: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(
                    JSON.stringify({
                        action: "subscribe",
                        symbol,
                    })
                );
            } catch {
                // Ignore socket send errors
            }
        }
    }

    private sendWsUnsubscription(symbol: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(
                    JSON.stringify({
                        action: "unsubscribe",
                        symbol,
                    })
                );
            } catch {
                // Ignore socket send errors
            }
        }
    }

    private handleWsMessage(raw: unknown): void {
        try {
            const text = typeof raw === "string" ? raw : String(raw);
            const payload = JSON.parse(text);

            if (payload?.type === "TICK" && typeof payload.symbol === "string") {
                const sym = payload.symbol.toUpperCase().trim();
                const ltp = Number(payload.data?.ltp);
                if (isNaN(ltp) || ltp <= 0) return;

                const volume = Number(payload.data?.volume) || 10;
                const rawTimestamp =
                    typeof payload.data?.timestamp === "number" && payload.data.timestamp > 0
                        ? payload.data.timestamp
                        : Date.now();
                const tickTimeSec =
                    rawTimestamp > 1e11 ? Math.floor(rawTimestamp / 1000) : rawTimestamp;

                // Deliver live bar updates to matching subscribers
                for (const sub of this.subscribers.values()) {
                    if (sub.symbol === sym) {
                        const bucketStart =
                            Math.floor(tickTimeSec / sub.intervalSec) * sub.intervalSec;

                        if (!sub.currentBar || bucketStart > sub.currentBar.time) {
                            // Period rolled over or initial candle formation
                            sub.currentBar = {
                                time: bucketStart,
                                open: sub.currentBar ? sub.currentBar.close : ltp,
                                high: sub.currentBar ? Math.max(sub.currentBar.close, ltp) : ltp,
                                low: sub.currentBar ? Math.min(sub.currentBar.close, ltp) : ltp,
                                close: ltp,
                                volume,
                            };
                        } else {
                            // Intra-candle live update
                            sub.currentBar = {
                                ...sub.currentBar,
                                high: Math.max(sub.currentBar.high, ltp),
                                low: Math.min(sub.currentBar.low, ltp),
                                close: ltp,
                                volume: (sub.currentBar.volume ?? 0) + volume,
                            };
                        }

                        sub.onBar({ ...sub.currentBar });
                    }
                }

                // Notify external quote listeners (e.g., Watchlist Header LTP pill)
                if (this.onTickCallback) {
                    const change =
                        typeof payload.data?.change === "number" ? payload.data.change : 0;
                    const changePercent =
                        typeof payload.data?.changePercent === "number"
                            ? payload.data.changePercent
                            : 0;
                    this.onTickCallback(ltp, change, changePercent, sym);
                }
            }
        } catch (err) {
            console.warn("[NexbidOpenAlgoDataFeed] Error parsing WS tick:", err);
        }
    }

    /**
     * Teardown WebSocket connections and timers.
     */
    destroy(): void {
        this.isDestroyed = true;

        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            try {
                this.ws.close();
            } catch {
                // Ignore socket close errors
            }
            this.ws = null;
        }

        this.subscribers.clear();
        this.onTickCallback = undefined;
    }
}
