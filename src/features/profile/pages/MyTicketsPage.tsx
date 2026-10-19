export function MyTicketsPage() {
    return (
        <div className="flex flex-col flex-1 h-full">
            <h1 className="text-2xl font-semibold text-dash-text">My Tickets</h1>

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
                            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-dash-text mb-2">Helpdesk & Support Tickets</h2>
                <p className="text-sm text-dash-text-muted">
                    Track your open support requests, queries, and dispute tickets in real-time.
                </p>
            </div>
        </div>
    );
}
