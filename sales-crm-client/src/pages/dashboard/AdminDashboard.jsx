import React, { useState, useEffect } from "react";
import {
    LayoutDashboard, Users, Building2, Briefcase, Zap,
    TrendingUp, ArrowUpRight, ArrowDownRight, Activity,
    Calendar, DollarSign
} from "lucide-react";
import { getDeals } from "../../../API/services/dealService";
import { getCompanies } from "../../../API/services/companyService";
import { getContacts } from "../../../API/services/contactService";
import { getTeamUsers } from "../../../API/services/userService";
import { toast } from "react-hot-toast";

const OverviewStat = ({ label, value, trend, icon: IconComp, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${color}`}>
                <IconComp size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        deals: 0,
        companies: 0,
        contacts: 0,
        users: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [dealsRes, companiesRes, contactsRes, usersRes] = await Promise.all([
                getDeals({ limit: 1 }),
                getCompanies({ limit: 1 }),
                getContacts({ limit: 1 }),
                getTeamUsers()
            ]);

            const dealsData = dealsRes.data;
            setStats({
                deals: dealsData.total || 0,
                companies: companiesRes.data.total || 0,
                contacts: contactsRes.data.total || 0,
                users: usersRes.data.data?.length || 0,
                totalValue: dealsData.data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Global performance and system health overview</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm">
                    <Calendar size={16} className="text-red-500" />
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OverviewStat
                    label="Total Revenue"
                    value={`$${(stats.totalValue / 1000).toFixed(1)}K`}
                    trend={12}
                    icon={DollarSign}
                    color="bg-red-50 text-red-600"
                />
                <OverviewStat
                    label="Active Deals"
                    value={stats.deals}
                    trend={8}
                    icon={Briefcase}
                    color="bg-orange-50 text-orange-600"
                />
                <OverviewStat
                    label="Total Companies"
                    value={stats.companies}
                    trend={-2}
                    icon={Building2}
                    color="bg-rose-50 text-rose-600"
                />
                <OverviewStat
                    label="System Users"
                    value={stats.users}
                    trend={5}
                    icon={Users}
                    color="bg-gray-100 text-gray-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
                        <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-lg px-3 py-1.5 focus:ring-0">
                            <option>Last 6 months</option>
                            <option>Last year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end gap-3 px-2">
                        {[40, 70, 45, 90, 65, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div
                                    className="w-full bg-red-100 group-hover:bg-red-500 transition-colors duration-300 rounded-t-lg relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ${h}k
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Network Status</h2>
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                <Zap size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-700">API Health</span>
                                    <span className="text-xs font-bold text-green-600">99.9%</span>
                                </div>
                                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[99%]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <TrendingUp size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-700">Storage</span>
                                    <span className="text-xs font-bold text-blue-600">42%</span>
                                </div>
                                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[42%]" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-red-500" />
                                Action Items
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    Review 5 pending user invitations
                                </li>
                                <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Check 2 stagnant deals in negotiation
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
