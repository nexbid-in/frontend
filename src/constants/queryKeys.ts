export const QUERY_KEYS = {
    wallet: {
        all: ["wallet"],
        overview: () => ["wallet", "overview"],
        statement: (params: { page: number; limit?: number; type?: string; search?: string }) => [
            "wallet",
            "statement",
            params,
        ],
        topupHistory: (params: { page: number; limit?: number; status?: string; search?: string }) => [
            "wallet",
            "topup-history",
            params,
        ],
    },
    admin: {
        all: ["admin"],
        users: (params: { page: number; limit: number; search: string; status: string }) => [
            "admin",
            "users",
            params,
        ],
    },
    profile: {
        details: () => ["profile"],
    },
    watchlist: {
        all: ["watchlist"],
        user: () => ["watchlist", "user"],
    },
    stocks: {
        all: ["stocks"],
        search: (query: string) => ["stocks", "search", query],
    },
};
