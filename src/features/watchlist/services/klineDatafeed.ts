import type { Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback } from "@klinecharts/pro";
import type { KLineData } from "klinecharts";
import { getStockMarketQuote, getStockFundamentals } from "../utils/stockPriceHelper";

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

export type TickListener = (price: number, change: number, changePercent: number) => void;

/**
 * High-performance realtime Datafeed for KLineChartPro.
 * Provides realistic intraday & daily candlestick history, and streams live tick-by-tick
 * updates simulating real Indian exchange (NSE) market volatility.
 * 
 * Architecture is designed to seamlessly plug in Fyers API v3 WebSocket credentials.
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

    async getHistoryKLineData(symbol: SymbolInfo, period: Period): Promise<KLineData[]> {
        const quote = getStockMarketQuote(symbol.ticker);
        const fundamentals = getStockFundamentals(symbol.ticker);
        const periodMs = getPeriodMs(period);

        const count = 180;
        const now = Date.now();
        const alignedNow = Math.floor(now / periodMs) * periodMs;
        const startTime = alignedNow - count * periodMs;

        let hash = 0;
        for (let i = 0; i < symbol.ticker.length; i++) {
            hash = (hash << 5) - hash + symbol.ticker.charCodeAt(i);
            hash |= 0;
        }
        const seed = Math.abs(hash) % 1000;

        const data: KLineData[] = [];
        let runningPrice = quote.price * 0.92;

        for (let i = 0; i < count; i++) {
            const timestamp = startTime + i * periodMs;
            const isLast = i === count - 1;

            if (isLast) {
                const lastBar: KLineData = {
                    timestamp,
                    open: fundamentals.open,
                    high: Math.max(fundamentals.dayHigh, quote.price),
                    low: Math.min(fundamentals.dayLow, quote.price),
                    close: quote.price,
                    volume: fundamentals.volume,
                    turnover: fundamentals.volume * quote.price,
                };
                data.push(lastBar);
                this.currentCandle = { ...lastBar };
                break;
            }

            const wave = Math.sin((i + seed) * 0.12) * 0.015;
            const noise = (((i * 5 + seed) % 9) - 4) * 0.004;
            const dayFactor = 1 + wave + noise;

            const open = Math.round(runningPrice * 100) / 100;
            const close = Math.round(open * dayFactor * 100) / 100;
            const highNoise = Math.abs(Math.sin(i * 2 + seed)) * 0.007 + 0.002;
            const lowNoise = Math.abs(Math.cos(i * 3 + seed)) * 0.007 + 0.002;

            const high = Math.round((Math.max(open, close) + open * highNoise) * 100) / 100;
            const low = Math.round((Math.min(open, close) - open * lowNoise) * 100) / 100;
            const volume = Math.round(50000 + Math.abs(Math.sin(i + seed) * 450000));

            data.push({
                timestamp,
                open,
                high,
                low,
                close,
                volume,
                turnover: volume * close,
            });

            runningPrice = close;
        }

        return data;
    }

    subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
        this.unsubscribe(symbol, period);

        const periodMs = getPeriodMs(period);
        const quote = getStockMarketQuote(symbol.ticker);
        const prevClose = quote.price - quote.change;

        // Initialize last candle if not already loaded
        if (!this.currentCandle) {
            const now = Date.now();
            const timestamp = Math.floor(now / periodMs) * periodMs;
            this.currentCandle = {
                timestamp,
                open: quote.price,
                high: quote.price,
                low: quote.price,
                close: quote.price,
                volume: 1000,
                turnover: 1000 * quote.price,
            };
        }

        // Live Market Tick Engine: pulses price every 800ms
        this.subscribeTimer = window.setInterval(() => {
            if (!this.currentCandle) return;

            const now = Date.now();
            const candleSlot = Math.floor(now / periodMs) * periodMs;

            // Micro-tick random fluctuation (between -0.15% to +0.15%)
            const fluctuationPercent = (Math.random() - 0.49) * 0.003;
            const tickDelta = this.currentCandle.close * fluctuationPercent;
            const newClose = Math.round((this.currentCandle.close + tickDelta) * 100) / 100;
            const tickVol = Math.floor(Math.random() * 80) + 10;

            if (candleSlot > this.currentCandle.timestamp) {
                // New candle period begins (e.g. new minute rolled over)
                this.currentCandle = {
                    timestamp: candleSlot,
                    open: newClose,
                    high: newClose,
                    low: newClose,
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
                this.onTickCallback(newClose, totalChange, totalChangePercent);
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
