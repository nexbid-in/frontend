export function JournalPage() {
    return (
        <div className="flex flex-col flex-1 h-full">
            <h1 className="text-2xl font-semibold text-[#E6E7EA]">Journal</h1>

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
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#E6E7EA] mb-2">Trading Journal & Notes</h2>
                <p className="text-sm text-dash-text-muted">
                    Log your daily trading thesis, review past mistakes, and refine your edge over time.
                </p>
            </div>
        </div>
    );
}
