export interface StockMarketQuote {
    price: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
}

// Baseline prices for popular Indian stocks & indices to match real market data
const BASELINE_PRICES: Record<string, { price: number; change: number; changePercent: number }> = {
    HEROMOTOCO: { price: 5296.0, change: -30.0, changePercent: -0.56 },
    JSWSTEEL: { price: 1171.7, change: 2.9, changePercent: 0.25 },
    TATASTEEL: { price: 181.37, change: 4.1, changePercent: 2.31 },
    UPL: { price: 747.95, change: 14.6, changePercent: 1.99 },
    RELIANCE: { price: 1478.0, change: -18.1, changePercent: -1.21 },
    HDFCBANK: { price: 982.3, change: -2.35, changePercent: -0.24 },
    TATAMOTORS: { price: 968.4, change: 12.2, changePercent: 1.28 },
    TCS: { price: 4120.5, change: -15.8, changePercent: -0.38 },
    INFY: { price: 1884.2, change: 8.6, changePercent: 0.46 },
    ICICIBANK: { price: 1262.15, change: 5.4, changePercent: 0.43 },
    SBIN: { price: 814.9, change: -3.2, changePercent: -0.39 },
    ITC: { price: 489.65, change: 1.15, changePercent: 0.24 },
    BHARTIARTL: { price: 1685.0, change: 21.5, changePercent: 1.29 },
    KOTAKBANK: { price: 1782.3, change: -6.7, changePercent: -0.37 },
    LT: { price: 3560.0, change: 34.0, changePercent: 0.96 },
    AXISBANK: { price: 1184.5, change: -4.1, changePercent: -0.35 },
    BAJFINANCE: { price: 6890.0, change: -45.0, changePercent: -0.65 },
    MARUTI: { price: 12150.0, change: 85.0, changePercent: 0.7 },
    SUNPHARMA: { price: 1860.0, change: 14.2, changePercent: 0.77 },
    TITAN: { price: 3420.0, change: -18.5, changePercent: -0.54 },
    WIPRO: { price: 545.2, change: 3.1, changePercent: 0.57 },
    ADANIENT: { price: 3120.0, change: -22.0, changePercent: -0.7 },
    NIFTY: { price: 25492.3, change: -17.4, changePercent: -0.07 },
    BANKNIFTY: { price: 56334.1, change: 102.8, changePercent: 0.18 },
    "NIFTY 50": { price: 25492.3, change: -17.4, changePercent: -0.07 },
    "NIFTY BANK": { price: 56334.1, change: 102.8, changePercent: 0.18 },
    "NIFTY IT": { price: 42150.0, change: 180.5, changePercent: 0.43 },
};

/**
 * Returns a realistic market quote for a given stock symbol.
 * Falls back to a deterministic calculation based on symbol characters if not explicitly in baseline map.
 */
export function getStockMarketQuote(symbol: string): StockMarketQuote {
    const cleanSymbol = symbol.toUpperCase().trim();
    const baseline = BASELINE_PRICES[cleanSymbol];

    if (baseline) {
        return {
            price: baseline.price,
            change: baseline.change,
            changePercent: baseline.changePercent,
            isPositive: baseline.change >= 0,
        };
    }

    // Deterministic fallback based on symbol char codes
    let hash = 0;
    for (let i = 0; i < cleanSymbol.length; i++) {
        hash = (hash << 5) - hash + cleanSymbol.charCodeAt(i);
        hash |= 0;
    }
    const absHash = Math.abs(hash);
    const price = 100 + (absHash % 4900) + ((absHash % 99) / 100);
    const changeFactor = (absHash % 500) / 100 - 2.5; // range -2.5% to +2.5%
    const change = Math.round(((price * changeFactor) / 100) * 100) / 100;
    const changePercent = Math.round(changeFactor * 100) / 100;

    return {
        price,
        change,
        changePercent,
        isPositive: change >= 0,
    };
}

export function formatINR(val: number): string {
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(val);
}

/**
 * Dynamically converts full legal company names into clean trading brand names (e.g. Zerodha Kite).
 * Scalable for all existing database stocks and any new stocks added by admins.
 * E.g., "Tata Motors Limited" -> "Tata Motors", "Infosys Limited" -> "Infosys"
 */
export function formatStockDisplayName(name: string, symbol?: string): string {
    if (!name || typeof name !== "string") return symbol || "";

    const cleaned = name
        // 1. Remove parenthetical country/region tags like "(India)", "(I)"
        .replace(/\s*\((India|I|IN)\)/gi, "")
        // 2. Remove standard legal entity suffixes at word boundaries
        .replace(
            /\b(Private|Public)?\s*(Limited|Ltd\.?|Corporation|Corp\.?|Holdings?|Enterprise(s)?)\b/gi,
            ""
        )
        // 3. Remove index benchmark descriptors (e.g. "Benchmark Index", "Benchmark")
        .replace(/\b(Benchmark\s+Index|Benchmark)\b/gi, "")
        // 4. Remove trailing symbols, dots, commas, dashes, or ampersands left after removal
        .replace(/[\s,.-]+$/, "")
        // 5. Collapse multiple spaces into one
        .replace(/\s{2,}/g, " ")
        .trim();

    return cleaned || name || symbol || "";
}

export interface StockFundamentals {
    open: number;
    prevClose: number;
    dayLow: number;
    dayHigh: number;
    week52Low: number;
    week52High: number;
    volume: number;
    avgPrice: number;
    lowerCircuit: number;
    upperCircuit: number;
}

/**
 * Returns comprehensive market fundamentals and ranges derived from current quote
 */
export function getStockFundamentals(symbol: string): StockFundamentals {
    const quote = getStockMarketQuote(symbol);
    const prevClose = Math.round((quote.price - quote.change) * 100) / 100;
    const open = Math.round((prevClose + quote.change * 0.35) * 100) / 100;

    let dayLow = Math.round((Math.min(open, quote.price) - Math.abs(quote.price * 0.009)) * 100) / 100;
    let dayHigh = Math.round((Math.max(open, quote.price) + Math.abs(quote.price * 0.013)) * 100) / 100;

    if (dayLow >= quote.price) {
        dayLow = Math.round(quote.price * 0.988 * 100) / 100;
    }
    if (dayHigh <= quote.price) {
        dayHigh = Math.round(quote.price * 1.014 * 100) / 100;
    }

    const week52Low = Math.round(quote.price * 0.72 * 100) / 100;
    const week52High = Math.round(quote.price * 1.38 * 100) / 100;
    const avgPrice = Math.round(((dayLow + dayHigh + quote.price) / 3) * 100) / 100;
    const lowerCircuit = Math.round(prevClose * 0.90 * 100) / 100;
    const upperCircuit = Math.round(prevClose * 1.10 * 100) / 100;

    // Deterministic volume based on symbol
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        hash = (hash << 5) - hash + symbol.charCodeAt(i);
        hash |= 0;
    }
    const volume = 1450000 + (Math.abs(hash) % 7200000);

    return {
        open,
        prevClose,
        dayLow,
        dayHigh,
        week52Low,
        week52High,
        volume,
        avgPrice,
        lowerCircuit,
        upperCircuit,
    };
}

export function formatVolume(volume: number): string {
    if (volume >= 10000000) {
        return `${(volume / 10000000).toFixed(2)} Cr`;
    }
    if (volume >= 100000) {
        return `${(volume / 100000).toFixed(2)} L`;
    }
    if (volume >= 1000) {
        return `${(volume / 1000).toFixed(2)} K`;
    }
    return volume.toLocaleString("en-IN");
}

