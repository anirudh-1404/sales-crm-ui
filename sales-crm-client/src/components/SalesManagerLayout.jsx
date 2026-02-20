import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Briefcase, Building2, ContactRound, Users2,
    Bell, Search, Menu, Moon, LayoutGrid, LogOut
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import GlobalSearch from "./GlobalSearch";
import LogoutConfirmModal from "./LogoutConfirmModal";


const SidebarLink = ({ to, icon: IconComp, label }) => (
    <NavLink to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
      ${isActive ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
        }>
        {({ isActive }) => (
            <>
                <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}>
                    <IconComp size={18} />
                </span>
                <span className="flex-1">{label}</span>
            </>
        )}
    </NavLink>
);

export default function SalesManagerLayout() {
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();
    const [showLogout, setShowLogout] = useState(false);

    const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "M";

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>

                <div className="h-16 flex items-center px-5 border-b border-gray-100">
                    <Logo className="flex items-center" />
                </div>

                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-purple-700">Sales Manager</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Overview</p>
                        <div className="space-y-1">
                            <SidebarLink to="/manager/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <SidebarLink to="/manager/team" icon={Users2} label="My Team" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Team CRM</p>
                        <div className="space-y-1">
                            <SidebarLink to="/manager/deals" icon={Briefcase} label="Team Deals" />
                            <SidebarLink to="/manager/companies" icon={Building2} label="Team Companies" />
                            <SidebarLink to="/manager/contacts" icon={ContactRound} label="Team Contacts" />
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100 pb-20 lg:pb-4">
                    <button
                        onClick={() => setShowLogout(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-5 gap-4 flex-shrink-0">
                    <button onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                        <Menu size={18} />
                    </button>
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-2 flex-1 max-w-xs pl-3 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-400 hover:border-purple-300 hover:bg-purple-50/30 transition text-left"
                    >
                        <Search size={15} />
                        <span className="flex-1">Search...</span>
                        <kbd className="hidden sm:block text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">Ctrl K</kbd>
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"><LayoutGrid size={18} /></button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"><Moon size={18} /></button>
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold text-sm shadow">{initials}</div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800 leading-none">{user ? `${user.firstName} ${user.lastName}` : "Manager"}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user?.email || "Sales Manager"}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto"><Outlet /></main>

                <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-6 text-xs text-gray-400 flex-shrink-0">
                    <span>Copyright &copy; <span className="text-purple-500 font-medium">mbdConsulting</span></span>
                    <div className="flex gap-4">
                        <span className="hover:text-gray-600 cursor-pointer">About</span>
                        <span className="hover:text-gray-600 cursor-pointer">Terms</span>
                        <span className="hover:text-gray-600 cursor-pointer">Contact Us</span>
                    </div>
                </footer>
            </div>

            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <LogoutConfirmModal
                isOpen={showLogout}
                onClose={() => setShowLogout(false)}
                onConfirm={() => { logout(); navigate("/login"); }}
            />
        </div>
    );
}
