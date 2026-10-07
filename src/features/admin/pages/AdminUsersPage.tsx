import { useState, useEffect } from "react";
import { adminService, type AdminUserListItemDTO } from "../services/adminService";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    const [users, setUsers] = useState<AdminUserListItemDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [confirmModalState, setConfirmModalState] = useState<{ isOpen: boolean, userId: string, isBlocked: boolean }>({ isOpen: false, userId: "", isBlocked: false });
    const limit = 6;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await adminService.getUsers(page, limit, searchQuery, statusFilter);
            setUsers(response.users || []);
            setTotalPages(response.pagination?.totalPages || 1);
            setTotalUsers(response.pagination?.totalUsers || 0);
        } catch (err: any) {
            setError(err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (user: AdminUserListItemDTO) => {
        setConfirmModalState({ isOpen: true, userId: user.id, isBlocked: user.isBlocked });
    };

    const confirmUpdateStatus = () => {
        const { userId } = confirmModalState;
        setConfirmModalState({ isOpen: false, userId: "", isBlocked: false });
        if (userId) {
            handleUpdateStatus(userId);
        }
    };

    const cancelConfirmModal = () => {
        setConfirmModalState({ isOpen: false, userId: "", isBlocked: false });
    };

    const handleUpdateStatus = async (userId: string) => {
        try {
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
            ));
            await adminService.updateUserStatus(userId);
        } catch (err: any) {
            setError(err.message || "Failed to update user status");
            fetchUsers(); 
        }
    };


    const getStatusBadge = (isBlocked: boolean) => {
        if (isBlocked) {
            return (
                <span className="inline-flex justify-center items-center w-20 py-1 rounded-lg text-xs font-medium bg-red/10 text-red">
                    Blocked
                </span>
            );
        }
        return (
            <span className="inline-flex justify-center items-center w-20 py-1 rounded-lg text-xs font-medium bg-green/10 text-green">
                Active
            </span>
        );
    };

    const getInitials = (firstName: string, lastName: string) => {
        const f = firstName ? firstName.charAt(0) : "";
        const l = lastName ? lastName.charAt(0) : "";
        return (f + l).toUpperCase() || "U";
    };

    const formatDate = (dateValue: string | Date | null) => {
        if (!dateValue) return "Never";
        const date = new Date(dateValue);
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatLastActive = (dateValue: string | Date | null) => {
        if (!dateValue) return "Never";
        const date = new Date(dateValue);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        
        if (diffMs < 0) return "Just now";

        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks <= 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        
        return formatDate(dateValue);
    };

    return (
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <section className="rounded-xl border border-border-muted bg-card overflow-hidden">
                <div className="p-5 border-b border-border-muted space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">User Management</h2>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Manage and monitor all registered users on the platform.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary font-medium self-start sm:self-auto">
                            <svg className="w-4 h-4 text-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>
                                <strong className="font-semibold text-text-primary">{totalUsers}</strong> Total Users
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="sm:col-span-2 relative">
                            <svg className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or user ID..."
                                className="w-full bg-panel-2 border border-border-muted rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-green transition-colors"
                            />
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-green transition-colors"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-text-secondary text-sm">Loading users...</div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-48 text-red text-sm">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-text-secondary text-sm">No users found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-muted bg-panel-2/50 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                                    <th className="py-3 px-5">User</th>
                                    <th className="py-3 px-5">Email</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5">Account Created</th>
                                    <th className="py-3 px-5">Last Active</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-muted text-sm">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-panel-2/40 transition-colors">
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs text-green`}>
                                                        {getInitials(user.firstName, user.lastName)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-text-primary">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs font-mono text-text-secondary">
                                                        ID: {user.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-sm text-text-secondary">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-text-secondary/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">{getStatusBadge(user.isBlocked)}</td>
                                        <td className="py-3 px-5 text-xs text-text-secondary">{formatDate(user.createdAt)}</td>
                                        <td className="py-3 px-5 text-xs text-text-secondary">{formatLastActive(user.lastActiveAt)}</td>
                                        <td className="py-3 px-5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openConfirmModal(user)}
                                                className={`inline-flex justify-center items-center w-20 py-1 rounded-lg text-xs font-medium bg-panel-2 border border-border-muted transition-colors cursor-pointer ${
                                                    user.isBlocked 
                                                        ? "text-green hover:border-green/50 hover:bg-green/5" 
                                                        : "text-red hover:border-red/50 hover:bg-red/5"
                                                }`}
                                            >
                                                {user.isBlocked ? "Unblock" : "Block"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Table Pagination / Footer */}
                <div className="p-4 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                    <div>
                        Showing <span className="font-medium text-text-primary">{(page - 1) * limit + (users.length > 0 ? 1 : 0)}</span> to{" "}
                        <span className="font-medium text-text-primary">{Math.min(page * limit, totalUsers)}</span> of{" "}
                        <span className="font-medium text-text-primary">{totalUsers}</span> users
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Previous
                        </button>
                        
                        <span className="px-2 font-medium">Page {page} of {totalPages || 1}</span>

                        <button
                            type="button"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>

            <ConfirmModal
                isOpen={confirmModalState.isOpen}
                title="Confirm Action"
                message={
                    <>
                        Are you sure you want to <span className="font-semibold text-text-primary">{confirmModalState.isBlocked ? "unblock" : "block"}</span> this user?
                    </>
                }
                confirmText={confirmModalState.isBlocked ? "Unblock User" : "Block User"}
                confirmButtonVariant={confirmModalState.isBlocked ? "success" : "danger"}
                onConfirm={confirmUpdateStatus}
                onCancel={cancelConfirmModal}
            />
        </main>
    );
}
