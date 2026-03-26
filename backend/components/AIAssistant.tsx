
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { getMarketplaceInsights } from '../services/geminiService';

interface AIAssistantProps {
  context: {
    stats: any;
    users: any[];
    bookings: any[];
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getMarketplaceInsights(context.stats, context.users, context.bookings);
    setInsight(result || "No specific insights found.");
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ICONS.Bot className="w-5 h-5" />
              <span className="font-bold">Marketplace AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 rounded-lg p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto bg-slate-50 flex-1">
            {!insight ? (
              <div className="text-center py-8">
                <ICONS.Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-sm mb-4 font-medium">I can analyze your current marketplace data and suggest improvements.</p>
                <button 
                   onClick={fetchInsights}
                   disabled={loading}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Generate Insights'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-xs text-indigo-600 font-bold uppercase mb-2">Marketplace Health Report</p>
                  <div className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                    {insight}
                  </div>
                </div>
                <button 
                  onClick={() => setInsight(null)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Start New Analysis
                </button>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-white border-t border-slate-100">
             <p className="text-[10px] text-slate-400 text-center font-medium">Powered by Gemini AI 3 Flash</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-slate-800 rotate-90 scale-90' : 'bg-indigo-600 hover:scale-110 hover:shadow-indigo-400'
        }`}
      >
        <ICONS.Bot className="w-7 h-7" />
      </button>
    </div>
  );
};

export default AIAssistant;
