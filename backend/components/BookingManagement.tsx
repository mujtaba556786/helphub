
import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { ICONS } from '../constants';

interface BookingManagementProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const BookingManagementView: React.FC<BookingManagementProps> = ({ bookings, setBookings }) => {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'All'>('All');
  const [viewingTranscript, setViewingTranscript] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(b => activeFilter === 'All' || b.status === activeFilter);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case BookingStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case BookingStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
      case BookingStatus.EXPIRED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex p-1 bg-slate-200 rounded-2xl">
          {['All', BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === status 
                ? 'bg-white text-indigo-600 shadow-lg' 
                : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {/* Fix: Added 'idx' parameter to map callback to prevent 'Cannot find name idx' error on line 52 */}
        {filteredBookings.map((booking, idx) => (
          <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-300 hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {booking.id.replace(/\D/g, '') || idx + 1}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{booking.serviceName}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">{booking.customerName}</span>
                  <span>•</span>
                  <span>Agreement: {booking.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-12">
              <div className="text-center md:text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Provider</p>
                <p className="text-sm font-bold text-slate-900">{booking.providerName}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <button 
                    onClick={() => setViewingTranscript(booking)}
                    className="mt-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                >
                    Audit Transcript
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transcript Modal */}
      {viewingTranscript && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                  <div className="bg-indigo-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-3xl font-black italic tracking-tighter">Marketplace Audit</h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Ref: {viewingTranscript.id} • Secure Archive</p>
                      </div>
                      <button onClick={() => setViewingTranscript(null)} className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
                  </div>
                  <div className="p-10 space-y-8">
                      <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-start space-x-4">
                          <div className="mt-1">⚠️</div>
                          <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Audit Policy</p>
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">This transcript is for quality assurance only. Admins cannot modify messages to preserve legal integrity of the service contract.</p>
                          </div>
                      </div>
                      
                      <div className="max-h-[350px] overflow-y-auto p-8 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 shadow-inner">
                          <div className="flex flex-col space-y-6">
                              <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-200 relative">
                                  <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">Customer: {viewingTranscript.customerName}</p>
                                  <p className="text-sm text-slate-800 font-medium italic leading-relaxed">"Hello, I'm interested in the {viewingTranscript.serviceName} service. What is your base rate for a 2-hour job?"</p>
                                  <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45"></div>
                              </div>
                              <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-200 relative self-end ml-12">
                                  <p className="text-[10px] font-black text-indigo-200 mb-2 uppercase tracking-tighter">Provider: {viewingTranscript.providerName}</p>
                                  <p className="text-sm font-medium italic leading-relaxed">"Hi! My standard rate is negotiable depending on the complexity. I can do it for $60 if the location is within 10km."</p>
                                  <div className="absolute -right-2 top-6 w-4 h-4 bg-indigo-600 rotate-45"></div>
                              </div>
                              <p className="text-center text-[10px] text-slate-400 font-bold italic py-4 tracking-widest uppercase">--- Interaction Logged ---</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setViewingTranscript(null)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-black transition-all">Close Audit</button>
                          <button className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-3 hover:scale-[1.02] transition-all">
                              <ICONS.Bot className="w-5 h-5" />
                              <span>Analyze Intent</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BookingManagementView;
