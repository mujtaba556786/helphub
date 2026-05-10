
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { DashboardStats } from '../types';
import { ICONS, COLORS } from '../constants';

interface AnalyticsDashboardProps {
  stats: DashboardStats;
}

const AnalyticsDashboardView: React.FC<AnalyticsDashboardProps> = ({ stats }) => {
  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Area Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Platform Traffic</h3>
              <p className="text-sm font-medium text-slate-500">Ad Impressions over time</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.engagementData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dx={-10} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-2">Category Popularity</h3>
          <p className="text-sm font-medium text-slate-500 mb-8">User interest by service sector</p>
          <div className="h-72 w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={stats.categoryData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    >
                    {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-4">
              {stats.categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Ad Impressions</p>
            <h4 className="text-4xl font-black mb-4">{stats.adImpressions.toLocaleString()}</h4>
            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg">High Visibility</span>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/20">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Ad Clicks</p>
            <h4 className="text-4xl font-black mb-4">{stats.adClicks.toLocaleString()}</h4>
            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg">1.45% CTR</span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Avg Negotiation Time</p>
            <h4 className="text-4xl font-black text-slate-900 mb-4">18m</h4>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg text-emerald-600">Improving engagement</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardView;
