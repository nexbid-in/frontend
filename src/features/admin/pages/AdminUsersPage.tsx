import { useState } from "react";

interface UserAccount {
    id: string;
    code: string;
    name: string;
    email: string;
    avatarInitials: string;
    avatarColor: "green" | "accent" | "red" | "secondary";
    status: "active" | "blocked" | "inactive" | "pending";
    createdAt: string;
    openPositionsCount: number;
    exposure: string;
    lastActive: string;
}

const INITIAL_USERS: UserAccount[] = [
    {
        id: "1",
        code: "NB-10482",
        name: "Priya Singh",
        email: "priya@nexbid.app",
        avatarInitials: "PS",
        avatarColor: "green",
        status: "active",
        createdAt: "Jan 12, 2024",
        openPositionsCount: 6,
        exposure: "₹1.2 L",
        lastActive: "2 min ago",
    },
    {
        id: "2",
        code: "NB-10021",
        name: "Arjun Mehta",
        email: "arjun@nexbid.app",
        avatarInitials: "AM",
        avatarColor: "accent",
        status: "active",
        createdAt: "Aug 03, 2023",
        openPositionsCount: 0,
        exposure: "—",
        lastActive: "45 min ago",
    },
    {
        id: "3",
        code: "NB-09877",
        name: "Sara Nair",
        email: "sara@nexbid.app",
        avatarInitials: "SN",
        avatarColor: "red",
        status: "blocked",
        createdAt: "Nov 28, 2022",
        openPositionsCount: 1,
        exposure: "₹42k",
        lastActive: "3 days ago",
    },
    {
        id: "4",
        code: "NB-11204",
        name: "Rohan Sharma",
        email: "rohan.s@gmail.com",
        avatarInitials: "RS",
        avatarColor: "green",
        status: "active",
        createdAt: "Feb 14, 2024",
        openPositionsCount: 12,
        exposure: "₹4.6 L",
        lastActive: "10 min ago",
    },
    {
        id: "5",
        code: "NB-08912",
        name: "Vikram Patel",
        email: "vikram@patelcorp.in",
        avatarInitials: "VP",
        avatarColor: "secondary",
        status: "inactive",
        createdAt: "May 09, 2023",
        openPositionsCount: 0,
        exposure: "—",
        lastActive: "2 weeks ago",
    },
    {
        id: "6",
        code: "NB-12490",
        name: "Ananya Iyer",
        email: "ananya.iyer@nexbid.app",
        avatarInitials: "AI",
        avatarColor: "accent",
        status: "active",
        createdAt: "Mar 22, 2024",
        openPositionsCount: 4,
        exposure: "₹85k",
        lastActive: "15 min ago",
    },
];

export function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    const getStatusBadge = (status: UserAccount["status"]) => {
        switch (status) {
            case "active":
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green/10 text-green">
                        Active
                    </span>
                );
            case "blocked":
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red/10 text-red">
                        Blocked
                    </span>
                );
            case "inactive":
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-text-secondary">
                        Inactive
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-text-secondary">
                        Pending
                    </span>
                );
        }
    };

    const getAvatarColorClass = (color: UserAccount["avatarColor"]) => {
        switch (color) {
            case "green":
                return "text-primary-green";
            case "accent":
                return "text-accent";
            case "red":
                return "text-red";
            case "secondary":
            default:
                return "text-text-secondary";
        }
    };

    return (
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* User Management Table Section */}
            <section className="rounded-xl border border-border-muted bg-card overflow-hidden">
                {/* Section Header & Filters */}
                <div className="p-5 border-b border-border-muted space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">User Management</h2>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Manage and monitor all registered users on the platform.
                            </p>
                        </div>
                        {/* Total Users Display */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary font-medium self-start sm:self-auto">
                            <svg
                                className="w-4 h-4 text-primary-green shrink-0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>
                                <strong className="font-semibold text-text-primary">34</strong> Total Users
                            </span>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                        {/* Search Box */}
                        <div className="sm:col-span-2 relative">
                            <svg
                                className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or user ID..."
                                className="w-full bg-panel-2 border border-border-muted rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-green transition-colors"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors"
                            >
                                <option value="recent">Sort: Recently Active</option>
                                <option value="newest">Sort: Newest First</option>
                                <option value="positions">Sort: Highest Exposure</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-muted bg-panel-2/50 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                                <th className="py-3 px-5">User</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5">Account Created</th>
                                <th className="py-3 px-5">Open Positions</th>
                                <th className="py-3 px-5">Last Active</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-muted text-sm">
                            {INITIAL_USERS.map((user) => (
                                <tr key={user.id} className="hover:bg-panel-2/40 transition-colors">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs ${getAvatarColorClass(
                                                    user.avatarColor
                                                )}`}
                                            >
                                                {user.avatarInitials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary">{user.name}</p>
                                                <p className="text-xs font-mono text-text-secondary">
                                                    {user.code} · {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5">{getStatusBadge(user.status)}</td>
                                    <td className="py-3 px-5 text-xs text-text-secondary">{user.createdAt}</td>
                                    <td className="py-3 px-5">
                                        <div className="text-xs">
                                            <span className="font-medium text-text-primary">
                                                {user.openPositionsCount} open
                                            </span>
                                            <span className="text-text-secondary">
                                                {" "}
                                                · {user.exposure} {user.exposure !== "—" ? "exposure" : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-xs text-text-secondary">{user.lastActive}</td>
                                    <td className="py-3 px-5 text-right">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-panel-2 border border-border-muted text-text-secondary hover:text-text-primary hover:border-text-secondary/50 transition-colors cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination / Footer */}
                <div className="p-4 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                    <div>
                        Showing <span className="font-medium text-text-primary">1</span> to{" "}
                        <span className="font-medium text-text-primary">{INITIAL_USERS.length}</span> of{" "}
                        <span className="font-medium text-text-primary">34</span> users
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            disabled
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg bg-primary-green text-bg font-medium"
                        >
                            1
                        </button>
                        <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            2
                        </button>
                        <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            3
                        </button>
                        <span className="px-1 text-text-secondary/60">...</span>
                        <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            34
                        </button>
                        <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
