import { env } from "@/config/env";

export interface MarketTick {
    symbol: string;
    ltp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    change: number;
    changePercent: number;
    timestamp: number;
    atp?: number;
    bidPrice?: number | null;
    askPrice?: number | null;
    totalBuyQty?: number | null;
    totalSellQty?: number | null;
}

export type TickHandler = (tick: MarketTick) => void;

interface ClientWsMessage {
    action: "subscribe" | "unsubscribe";
    symbol: string;
}

export function getSymbolAliases(symbol: string): string[] {
    const sym = symbol.toUpperCase().trim();
    const spaceless = sym.replace(/\s+/g, "");
    const aliases = new Set<string>([sym, spaceless]);
    if (spaceless === "NIFTY50" || sym === "NIFTY 50" || sym === "NIFTY") {
        aliases.add("NIFTY 50");
        aliases.add("NIFTY50");
        aliases.add("NIFTY");
    } else if (spaceless === "BANKNIFTY" || sym === "NIFTY BANK" || spaceless === "NIFTYBANK") {
        aliases.add("BANKNIFTY");
        aliases.add("NIFTY BANK");
        aliases.add("NIFTYBANK");
    }
    return Array.from(aliases);
}

/**
 * Shared Singleton WebSocket Service for Live Market Feeds.
 *
 * Key Architecture Highlights:
 * 1. Single Shared Connection: Prevents connection churning and connection limit exhaustion.
 * 2. Client-Side Reference Counting: Multiple components (or multiple chart indicators/intervals)
 *    can subscribe to the same ticker without stepping on each other.
 * 3. Debounced Unsubscribe (500ms): Defeats React StrictMode double-invocation and screen/tab navigation
 *    race conditions where unmount/remount triggers an immediate `unsubscribe` right after `subscribe`.
 * 4. Tab Visibility & Focus Resilience: Auto-resumes, verifies socket health, and re-confirms active
 *    subscriptions on `visibilitychange`, `window.focus`, and `online` events without requiring page reload.
 */
class MarketWebSocketService {
    private ws: WebSocket | null = null;
    private subscribers = new Map<string, Set<TickHandler>>();
    private pendingUnsubscribes = new Map<string, ReturnType<typeof setTimeout>>();
    private latestTicks = new Map<string, MarketTick>();
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private resumeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private isExplicitlyDestroyed = false;
    private reconnectAttempts = 0;
    private readonly DEBOUNCE_MS = 500;

    constructor() {
        if (typeof window !== "undefined") {
            document.addEventListener("visibilitychange", this.handleVisibilityChange);
            window.addEventListener("focus", this.handleWindowFocus);
            window.addEventListener("online", this.handleOnline);
        }
    }

    private scheduleResume = (): void => {
        if (this.resumeDebounceTimer) {
            clearTimeout(this.resumeDebounceTimer);
        }
        this.resumeDebounceTimer = setTimeout(() => {
            this.resumeDebounceTimer = null;
            this.handleResume();
        }, 300);
    };

    private handleVisibilityChange = (): void => {
        if (document.visibilityState === "visible") {
            this.scheduleResume();
        }
    };

    private handleWindowFocus = (): void => {
        this.scheduleResume();
    };

    private handleOnline = (): void => {
        this.scheduleResume();
    };

    /**
     * Re-verify connection and re-confirm active subscriptions when the user returns to the tab/window.
     */
    private handleResume = (): void => {
        if (this.isExplicitlyDestroyed) return;

        // 1. If socket dropped or closed while in background, reconnect immediately
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            this.ensureConnected();
            return;
        }

        // 2. If socket is connecting, ensureConnected will handle subscriptions onopen
        if (this.ws.readyState === WebSocket.CONNECTING) {
            return;
        }

        // 3. If socket is already OPEN, it is healthy and active.
        // Simply cancel any pending unsubscriptions so active handlers keep receiving ticks.
        // DO NOT re-send "subscribe" messages to the backend! The backend is already streaming.
        if (this.ws.readyState === WebSocket.OPEN) {
            for (const [symbol, handlers] of this.subscribers.entries()) {
                if (handlers.size > 0) {
                    const timer = this.pendingUnsubscribes.get(symbol);
                    if (timer) {
                        clearTimeout(timer);
                        this.pendingUnsubscribes.delete(symbol);
                    }
                }
            }
        }
    };

    /**
     * Get the most recently received tick for a symbol if available in memory.
     */
    public getLatestTick(symbol: string): MarketTick | undefined {
        for (const alias of getSymbolAliases(symbol)) {
            const tick = this.latestTicks.get(alias);
            if (tick) return tick;
        }
        return undefined;
    }

    /**
     * Subscribe to live ticks for a symbol.
     * Returns a teardown function that unregisters the handler and manages debounced unsubscription.
     */
    public subscribe(symbol: string, handler: TickHandler): () => void {
        const sym = symbol.toUpperCase().trim();

        // 1. Cancel any pending unsubscription timer for this symbol immediately
        const pendingTimer = this.pendingUnsubscribes.get(sym);
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            this.pendingUnsubscribes.delete(sym);
        }

        // 2. Register handler in subscriber set
        let set = this.subscribers.get(sym);
        const isFirstSubscriber = !set || set.size === 0;
        if (!set) {
            set = new Set<TickHandler>();
            this.subscribers.set(sym, set);
        }
        set.add(handler);

        // 3. Ensure WebSocket is active
        this.ensureConnected();

        // 4. Send subscription packet if this is the first active handler
        if (isFirstSubscriber && this.ws?.readyState === WebSocket.OPEN) {
            this.send({ action: "subscribe", symbol: sym });
        }

        // 5. Return unsubscription teardown function
        return () => {
            this.unsubscribe(sym, handler);
        };
    }

    /**
     * Unsubscribe a handler with a 500ms debounce.
     */
    public unsubscribe(symbol: string, handler: TickHandler): void {
        const sym = symbol.toUpperCase().trim();
        const set = this.subscribers.get(sym);
        if (!set) return;

        set.delete(handler);

        // If there are still active handlers for this symbol, keep subscription active
        if (set.size > 0) return;

        // All active handlers for this symbol are removed
        this.subscribers.delete(sym);

        // Clear any existing debounce timer
        const existingTimer = this.pendingUnsubscribes.get(sym);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Start 500ms debounce window before notifying the backend
        const timer = setTimeout(() => {
            this.pendingUnsubscribes.delete(sym);

            // Double-check no new subscriber attached during the debounce window
            const currentSet = this.subscribers.get(sym);
            if (!currentSet || currentSet.size === 0) {
                this.send({ action: "unsubscribe", symbol: sym });
            }
        }, this.DEBOUNCE_MS);

        this.pendingUnsubscribes.set(sym, timer);
    }

    /**
     * Establish or maintain active WebSocket connection.
     */
    public ensureConnected(): void {
        if (this.isExplicitlyDestroyed) return;
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            const wsUrl = `${env.WS_URL}/ws/market-feed`;
            const socket = new WebSocket(wsUrl);
            this.ws = socket;

            socket.onopen = () => {
                if (this.isExplicitlyDestroyed) {
                    socket.close();
                    return;
                }
                this.reconnectAttempts = 0;

                // Subscribe all currently active symbols
                for (const [symbol, handlers] of this.subscribers.entries()) {
                    if (handlers.size > 0) {
                        this.send({ action: "subscribe", symbol });
                    }
                }
            };

            socket.onmessage = (event: MessageEvent) => {
                this.handleMessage(event.data);
            };

            socket.onerror = (err) => {
                console.warn("[MarketWebSocketService] WebSocket error:", err);
            };

            socket.onclose = () => {
                this.ws = null;
                if (!this.isExplicitlyDestroyed && this.hasActiveSubscribers() && !this.reconnectTimeout) {
                    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
                    this.reconnectAttempts++;
                    this.reconnectTimeout = setTimeout(() => {
                        this.reconnectTimeout = null;
                        this.ensureConnected();
                    }, delay);
                }
            };
        } catch (err) {
            console.warn("[MarketWebSocketService] Failed to establish WebSocket:", err);
        }
    }

    private hasActiveSubscribers(): boolean {
        for (const set of this.subscribers.values()) {
            if (set.size > 0) return true;
        }
        return false;
    }

    private send(msg: ClientWsMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(msg));
            } catch {
                // Ignore send errors
            }
        }
    }

    private handleMessage(raw: unknown): void {
        try {
            const text = typeof raw === "string" ? raw : String(raw);
            const payload = JSON.parse(text);

            if (payload?.type === "TICK" && typeof payload.symbol === "string") {
                const sym = payload.symbol.toUpperCase().trim();
                const ltp = Number(payload.data?.ltp ?? payload.ltp ?? payload.data?.price ?? payload.price);
                if (isNaN(ltp) || ltp <= 0) return;

                const open = typeof payload.data?.open === "number" ? payload.data.open : ltp;
                const high = typeof payload.data?.high === "number" ? payload.data.high : ltp;
                const low = typeof payload.data?.low === "number" ? payload.data.low : ltp;
                const close = typeof payload.data?.close === "number" ? payload.data.close : ltp;
                const volume =
                    typeof payload.data?.volume === "number" && !isNaN(payload.data.volume)
                        ? payload.data.volume
                        : undefined;
                let change =
                    typeof payload.data?.change === "number"
                        ? payload.data.change
                        : typeof payload.change === "number"
                        ? payload.change
                        : 0;
                let changePercent =
                    typeof payload.data?.changePercent === "number"
                        ? payload.data.changePercent
                        : typeof payload.changePercent === "number"
                        ? payload.changePercent
                        : 0;

                // Fallback: If backend didn't supply change/changePercent, calculate from close (PDC) or open
                if (change === 0 && ltp > 0) {
                    const basePrice = close > 0 && close !== ltp ? close : open > 0 && open !== ltp ? open : 0;
                    if (basePrice > 0) {
                        change = Math.round((ltp - basePrice) * 100) / 100;
                        changePercent = Math.round(((ltp - basePrice) / basePrice) * 10000) / 100;
                    }
                }

                const rawTimestamp =
                    typeof payload.data?.timestamp === "number" && payload.data.timestamp > 0
                        ? payload.data.timestamp
                        : Date.now();
                const timestamp = rawTimestamp > 1e11 ? rawTimestamp : rawTimestamp * 1000;

                const atp =
                    typeof payload.data?.atp === "number"
                        ? payload.data.atp
                        : typeof payload.atp === "number"
                        ? payload.atp
                        : undefined;
                const bidPrice =
                    typeof payload.data?.bidPrice === "number"
                        ? payload.data.bidPrice
                        : typeof payload.bidPrice === "number"
                        ? payload.bidPrice
                        : payload.data?.bidPrice === null || payload.bidPrice === null
                        ? null
                        : undefined;
                const askPrice =
                    typeof payload.data?.askPrice === "number"
                        ? payload.data.askPrice
                        : typeof payload.askPrice === "number"
                        ? payload.askPrice
                        : payload.data?.askPrice === null || payload.askPrice === null
                        ? null
                        : undefined;
                const totalBuyQty =
                    typeof payload.data?.totalBuyQty === "number"
                        ? payload.data.totalBuyQty
                        : typeof payload.totalBuyQty === "number"
                        ? payload.totalBuyQty
                        : payload.data?.totalBuyQty === null || payload.totalBuyQty === null
                        ? null
                        : undefined;
                const totalSellQty =
                    typeof payload.data?.totalSellQty === "number"
                        ? payload.data.totalSellQty
                        : typeof payload.totalSellQty === "number"
                        ? payload.totalSellQty
                        : payload.data?.totalSellQty === null || payload.totalSellQty === null
                        ? null
                        : undefined;

                const tick: MarketTick = {
                    symbol: sym,
                    ltp,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    change,
                    changePercent,
                    timestamp,
                    atp,
                    bidPrice,
                    askPrice,
                    totalBuyQty,
                    totalSellQty,
                };

                // Cache latest tick in memory for all aliases
                const aliases = getSymbolAliases(sym);
                for (const alias of aliases) {
                    this.latestTicks.set(alias, tick);
                }

                // Dispatch to all subscribers matching any alias (prevent duplicate invocation)
                const notified = new Set<TickHandler>();
                for (const alias of aliases) {
                    const set = this.subscribers.get(alias);
                    if (set) {
                        set.forEach((cb) => {
                            if (!notified.has(cb)) {
                                notified.add(cb);
                                try {
                                    cb(tick);
                                } catch (err) {
                                    console.error("[MarketWebSocketService] Tick callback error:", err);
                                }
                            }
                        });
                    }
                }
            }
        } catch (err) {
            console.warn("[MarketWebSocketService] Error parsing WS message:", err);
        }
    }

    public destroy(): void {
        this.isExplicitlyDestroyed = true;
        if (typeof window !== "undefined") {
            document.removeEventListener("visibilitychange", this.handleVisibilityChange);
            window.removeEventListener("focus", this.handleWindowFocus);
            window.removeEventListener("online", this.handleOnline);
        }
        for (const timer of this.pendingUnsubscribes.values()) {
            clearTimeout(timer);
        }
        this.pendingUnsubscribes.clear();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.resumeDebounceTimer) {
            clearTimeout(this.resumeDebounceTimer);
            this.resumeDebounceTimer = null;
        }

        if (this.ws) {
            try {
                this.ws.close();
            } catch {
                // Ignore socket close error
            }
            this.ws = null;
        }
        this.subscribers.clear();
        this.latestTicks.clear();
    }
}

export const marketWebSocketService = new MarketWebSocketService();
