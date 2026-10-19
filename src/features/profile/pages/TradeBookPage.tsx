export function TradeBookPage() {
    return (
        <div className="flex flex-col flex-1 h-full">
            <h1 className="text-2xl font-semibold text-dash-text">Trade Book</h1>

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
                            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-dash-text mb-2">Trade Execution History</h2>
                <p className="text-sm text-dash-text-muted">
                    Detailed records of all completed and pending executions will be displayed here.
                </p>
            </div>
        </div>
    );
}
