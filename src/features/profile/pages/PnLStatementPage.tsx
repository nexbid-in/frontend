export function PnLStatementPage() {
    return (
        <div className="flex flex-col flex-1 h-full">
            <h1 className="text-2xl font-semibold text-[#E6E7EA]">P&L Statement</h1>

            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                <div className="w-16 h-16 rounded-full bg-dash-panel-2 flex items-center justify-center text-primary-green mb-4">
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#E6E7EA] mb-2">Profit & Loss Statements</h2>
                <p className="text-sm text-dash-text-muted">
                    Your realized and unrealized profit & loss reports will appear here once trade activity is recorded.
                </p>
            </div>
        </div>
    );
}
