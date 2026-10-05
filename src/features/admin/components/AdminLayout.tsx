import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";

interface AdminLayoutProps {
    children?: ReactNode;
    title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="admin-theme bg-bg text-text-primary font-sans antialiased selection:bg-primary-green/20 selection:text-primary-green flex h-screen overflow-hidden">   
            <AdminSidebar
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-y-auto">             
                <AdminNavbar
                    title={title}
                    onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
                />
                {children || <Outlet />}
            </div>
        </div>
    );
}
