import type { Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback } from "@klinecharts/pro";
import type { KLineData } from "klinecharts";
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

export type TickListener = (price: number, change: number, changePercent: number, ticker?: string) => void;

function pseudoRandom(seed: number): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function getSymbolSeed(ticker: string): number {
    let hash = 0;
    for (let i = 0; i < ticker.length; i++) {
        hash = (hash << 5) - hash + ticker.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getPriceAtOffset(quotePrice: number, symSeed: number, offset: number): number {
    if (offset === 0) return quotePrice;
    const trend = Math.sin(offset * 0.05 + symSeed * 0.1) * 0.022;
    const swing = Math.cos(offset * 0.15 + symSeed * 0.3) * 0.012;
    const intraday = Math.sin(offset * 0.45 + symSeed * 0.7) * 0.005;
    const noise = (pseudoRandom(symSeed + offset * 13) - 0.5) * 0.005;
    const damp = Math.min(1, Math.abs(offset) / 4);
    const totalFactor = 1 + (trend + swing + intraday + noise) * damp;
    return Math.round(quotePrice * totalFactor * 100) / 100;
}

function generateCandle(quotePrice: number, symSeed: number, offset: number, timestamp: number): KLineData {
    const close = getPriceAtOffset(quotePrice, symSeed, offset);
    const prevClose = getPriceAtOffset(quotePrice, symSeed, offset - 1);
    const gapNoise = (pseudoRandom(symSeed + offset * 29) - 0.5) * 0.0008 * quotePrice;
    const open = Math.round((prevClose + gapNoise) * 100) / 100;

    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    const wickHigh = (pseudoRandom(symSeed + offset * 47) * 0.003 + 0.0005) * quotePrice;
    const wickLow = (pseudoRandom(symSeed + offset * 53) * 0.003 + 0.0005) * quotePrice;

    const high = Math.round((maxOC + wickHigh) * 100) / 100;
    const low = Math.round((minOC - wickLow) * 100) / 100;
    const volume = Math.round(25000 + pseudoRandom(symSeed + offset * 71) * 125000);

    return {
        timestamp,
        open,
        high,
        low,
        close,
        volume,
        turnover: Math.round(volume * close),
    };
}

/**
 * High-performance realtime Datafeed for KLineChartPro.
 * Provides realistic intraday & daily candlestick history, and streams live tick-by-tick
 * updates simulating real Indian exchange (NSE) market volatility.
 */
export class NexbidRealtimeDatafeed implements Datafeed {
    private subscribeTimer: number | null = null;
    private currentCandle: KLineData | null = null;
    private onTickCallback?: TickListener;

    constructor(onTick?: TickListener) {
        this.onTickCallback = onTick;
    }

    async searchSymbols(search?: string): Promise<SymbolInfo[]> {
        const query = (search ?? "").trim().toUpperCase();
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
        const quote = getStockMarketQuote(symbol.ticker);
        const periodMs = getPeriodMs(period);
        const now = Date.now();
        const alignedNow = Math.floor(now / periodMs) * periodMs;

        const targetTo = typeof to === "number" && to > 0 ? Math.min(to, alignedNow) : alignedNow;
        const targetFrom = typeof from === "number" && from > 0 && from < targetTo
            ? from
            : targetTo - 180 * periodMs;

        const symSeed = getSymbolSeed(symbol.ticker);
        const data: KLineData[] = [];

        const startBarSlot = Math.floor(targetFrom / periodMs) * periodMs;
        const endBarSlot = Math.floor(targetTo / periodMs) * periodMs;

        for (let ts = startBarSlot; ts <= endBarSlot; ts += periodMs) {
            const offset = Math.floor((ts - alignedNow) / periodMs);
            if (offset > 0) continue;

            const candle = generateCandle(quote.price, symSeed, offset, ts);
            data.push(candle);

            if (offset === 0) {
                this.currentCandle = { ...candle };
            }
        }

        if (data.length === 0) {
            const liveCandle = generateCandle(quote.price, symSeed, 0, alignedNow);
            data.push(liveCandle);
            this.currentCandle = { ...liveCandle };
        }

        return data;
    }

    subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
        this.unsubscribe(symbol, period);

        const periodMs = getPeriodMs(period);
        const quote = getStockMarketQuote(symbol.ticker);
        const prevClose = quote.price - quote.change;
        const symSeed = getSymbolSeed(symbol.ticker);

        if (!this.currentCandle) {
            const now = Date.now();
            const timestamp = Math.floor(now / periodMs) * periodMs;
            this.currentCandle = generateCandle(quote.price, symSeed, 0, timestamp);
        }

        // Live Market Tick Engine: pulses price every 800ms
        this.subscribeTimer = window.setInterval(() => {
            if (!this.currentCandle) return;

            const now = Date.now();
            const candleSlot = Math.floor(now / periodMs) * periodMs;

            // Micro-tick random fluctuation (between -0.08% to +0.08%)
            const fluctuationPercent = (Math.random() - 0.49) * 0.0016;
            const tickDelta = this.currentCandle.close * fluctuationPercent;
            const newClose = Math.round((this.currentCandle.close + tickDelta) * 100) / 100;
            const tickVol = Math.floor(Math.random() * 80) + 10;

            if (candleSlot > this.currentCandle.timestamp) {
                // New candle period begins (e.g. new minute rolled over)
                this.currentCandle = {
                    timestamp: candleSlot,
                    open: this.currentCandle.close,
                    high: Math.max(this.currentCandle.close, newClose),
                    low: Math.min(this.currentCandle.close, newClose),
                    close: newClose,
                    volume: tickVol,
                    turnover: tickVol * newClose,
                };
            } else {
                // Update active candle in real time
                this.currentCandle = {
                    ...this.currentCandle,
                    close: newClose,
                    high: Math.max(this.currentCandle.high, newClose),
                    low: Math.min(this.currentCandle.low, newClose),
                    volume: (this.currentCandle.volume ?? 0) + tickVol,
                    turnover: (this.currentCandle.turnover ?? 0) + tickVol * newClose,
                };
            }

            // Push tick to KLineChartPro
            callback(this.currentCandle);

            // Notify header / watchlist listeners of live price
            if (this.onTickCallback) {
                const totalChange = Math.round((newClose - prevClose) * 100) / 100;
                const totalChangePercent = Math.round(((newClose - prevClose) / prevClose) * 10000) / 100;
                this.onTickCallback(newClose, totalChange, totalChangePercent, symbol.ticker);
            }
        }, 800);
    }

    unsubscribe(symbol?: SymbolInfo, period?: Period): void {
        void symbol;
        void period;
        if (this.subscribeTimer !== null) {
            clearInterval(this.subscribeTimer);
            this.subscribeTimer = null;
        }
        this.currentCandle = null;
    }
}
