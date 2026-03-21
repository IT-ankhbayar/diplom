"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { Users, Home, Calendar, MousePointer2, TrendingUp, ArrowUpRight } from 'lucide-react';

const COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#484848', '#767676'];
const RANGES = ['today', '7d', '30d', '12m'] as const;
type RangeKey = typeof RANGES[number];
type AnalyticsResponse = {
    daily: {
        labels: string[];
        visitors: number[];
        newUsers: number[];
        bookings: number[];
    };
    totals: {
        visitors: number;
        users: number;
        bookings: number;
        listings: number;
    };
    bookingByCategory: { name: string; value: number }[];
};
type StatColor = 'rose' | 'blue' | 'teal' | 'amber';
type StatCardProps = {
    title: string;
    value: number;
    icon: React.ReactElement<{ size?: number }>;
    color: StatColor;
    trend: string;
};

const AdminAnalytics = () => {
    const [range, setRange] = useState<RangeKey>('7d');
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/analytics?range=${range}`);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [range]);

    const chartData = useMemo(() => {
        if (!data?.daily) return [];
        return data.daily.labels.map((label: string, index: number) => ({
            date: label,
            visitors: data.daily.visitors[index],
            newUsers: data.daily.newUsers[index],
            bookings: data.daily.bookings[index],
        }));
    }, [data]);

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
                <p className="text-sm font-semibold text-slate-600">Analyzing data streams...</p>
            </div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-rose-500 font-bold text-sm tracking-widest uppercase">Overview</span>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
                    </div>

                    <div className="flex items-center p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {RANGES.map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${range === r
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Traffic" value={data.totals.visitors} trend="+12.5%" icon={<MousePointer2 />} color="rose" />
                    <StatCard title="Users" value={data.totals.users} trend="+5.2%" icon={<Users />} color="blue" />
                    <StatCard title="Bookings" value={data.totals.bookings} trend="+18.1%" icon={<Calendar />} color="teal" />
                    <StatCard title="Listings" value={data.totals.listings} trend="+2.4%" icon={<Home />} color="amber" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area Chart */}
                    <div className="lg:col-span-2 group p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">User Growth & Traffic</h3>
                                <p className="text-slate-400 text-sm">Unique visitors vs registrations over time</p>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <ArrowUpRight className="text-slate-400" size={20} />
                            </button>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF5A5F" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FF5A5F" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="visitors" stroke="#FF5A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                                    <Area type="monotone" dataKey="newUsers" stroke="#00A699" strokeWidth={3} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Pie Chart */}
                    <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col items-center">
                        <div className="w-full text-left mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Market Share</h3>
                            <p className="text-slate-400 text-sm">Bookings by category</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.bookingByCategory}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {data.bookingByCategory.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for clean organization
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
    const colorMap: Record<StatColor, string> = {
        rose: "bg-rose-50 text-rose-500",
        blue: "bg-blue-50 text-blue-600",
        teal: "bg-teal-50 text-teal-600",
        amber: "bg-amber-50 text-amber-600"
    };

    return (
        <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-rose-200 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${colorMap[color]}`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <div className="flex items-center space-x-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-bold">{trend}</span>
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value.toLocaleString()}</p>
            </div>
        </div>
    );
};

export default AdminAnalytics;
