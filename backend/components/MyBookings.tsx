
import React from 'react';
import { Booking, BookingStatus } from '../types';
import { ICONS } from '../constants';

interface MyBookingsProps {
  bookings: Booking[];
}

const MyBookingsView: React.FC<MyBookingsProps> = ({ bookings }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Active Negotiations</h2>
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-full">
            <span>Conversations: {bookings.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <ICONS.Bookings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No active service negotiations found.</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-indigo-100 transition-all">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <ICONS.Chat className="w-8 h-8 text-indigo-600" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 leading-none mb-1">{booking.serviceName}</h4>
                      <p className="text-sm font-medium text-slate-500">In touch with <span className="text-slate-900 font-bold underline decoration-indigo-200">{booking.providerName}</span></p>
                      <div className="flex items-center space-x-4 mt-3">
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{booking.date}</span>
                         <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                             booking.status === BookingStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                             booking.status === BookingStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                             booking.status === BookingStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                             'bg-slate-100 text-slate-500'
                         }`}>
                             {booking.status === BookingStatus.PENDING ? 'Discussing Details' : booking.status}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center space-x-6 px-6">
                    <div className="flex space-x-2">
                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center space-x-2">
                            <ICONS.Chat className="w-4 h-4" />
                            <span>Open Chat</span>
                        </button>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* Ad Placeholder */}
      <div className="bg-slate-100 p-8 rounded-3xl border border-dashed border-slate-300 flex items-center justify-center">
         <div className="text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Sponsor</span>
            <p className="text-sm font-bold text-slate-500 mt-2">Booked a service? Get top-tier supplies through our store!</p>
            <div className="mt-4 flex flex-col items-center">
                <div className="w-48 h-10 bg-slate-200 rounded flex items-center justify-center italic text-[10px] text-slate-400">Google Ad Placeholder</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MyBookingsView;
