
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats } from '../types';
import { ICONS } from '../constants';
import { getTrafficInsights } from '../services/geminiService';

interface TrafficPerformanceViewProps {
  stats: DashboardStats;
}

const TrafficPerformanceView: React.FC<TrafficPerformanceViewProps> = ({ stats }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    const result = await getTrafficInsights(stats);
    setInsight(result);
    setLoading(false);
  };

  const ctr = ((stats.adClicks / stats.adImpressions) * 100).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard title="Total Impressions" value={stats.adImpressions.toLocaleString()} subtitle="Content Visibility" color="bg-indigo-600" />
        <MetricCard title="Engagement Rate" value={`${ctr}%`} subtitle="CTR (Interactions vs Impressions)" color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 italic">Interaction Volume</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.engagementData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <ICONS.Bot className="w-8 h-8 text-indigo-400" />
            <h3 className="text-xl font-black italic">Traffic Analyst</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {!insight ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm font-medium mb-6">Analyze reach and user actions to improve platform discovery.</p>
                <button 
                  onClick={fetchAIInsights}
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing Traffic...' : 'Generate Reach Report'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Engagement Strategy</p>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {insight}
                  </div>
                </div>
                <button onClick={() => setInsight(null)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Generate New Analysis</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, color }: any) => (
  <div className={`${color} p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group`}>
    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">{title}</p>
    <h4 className="text-4xl font-black mb-2 tracking-tighter">{value}</h4>
    <p className="text-xs font-bold text-white/40">{subtitle}</p>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
  </div>
);

export default TrafficPerformanceView;
