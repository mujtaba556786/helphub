
import React from 'react';
import { User, Booking, BookingStatus } from '../types';
import { ICONS } from '../constants';

interface ProviderDashboardProps {
  provider: User;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const ProviderDashboardView: React.FC<ProviderDashboardProps> = ({ provider, bookings, setBookings }) => {
  const pendingJobs = bookings.filter(b => b.status === BookingStatus.PENDING);
  const confirmedJobs = bookings.filter(b => b.status === BookingStatus.CONFIRMED);

  const updateBooking = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Provider Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6">
          <img src={provider.avatar} className="w-24 h-24 rounded-3xl shadow-2xl border-4 border-white" alt="" />
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{provider.name}</h2>
            <p className="text-slate-500 font-medium mb-4">{provider.bio}</p>
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400">★</span>
                    <span className="text-lg font-black text-slate-900">{provider.rating}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <span className="text-indigo-600 font-bold">{provider.completedJobs}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">Jobs Handled</span>
                </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform Visibility</p>
          <h4 className="text-2xl font-black mb-4">Top Expert</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Your profile appeared in 245 searches today. Reply to chats to stay featured.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Inquiries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Active Negotiations</h3>
            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-black">{pendingJobs.length} New</span>
          </div>
          {pendingJobs.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
              <p className="text-slate-400 font-bold">No current chat inquiries.</p>
            </div>
          ) : (
            pendingJobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-indigo-600">
                    {job.customerName[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-none mb-1">{job.customerName}</p>
                    <p className="text-sm font-medium text-slate-500">{job.serviceName} • Discussion phase</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20">
                    Reply
                  </button>
                  <button 
                    onClick={() => updateBooking(job.id, BookingStatus.CONFIRMED)}
                    className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-100"
                  >
                    Agree Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Agreed Jobs */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Agreed Services</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             {confirmedJobs.map((job, idx) => (
               <div key={job.id} className={`p-6 flex items-center justify-between ${idx !== confirmedJobs.length - 1 ? 'border-b border-slate-50' : ''}`}>
                 <div className="flex items-center space-x-4">
                    <div className="text-center w-12 py-2 bg-indigo-50 rounded-xl">
                      <p className="text-[10px] font-black text-indigo-600 uppercase">SCH</p>
                      <p className="text-lg font-black text-indigo-700">{Math.floor(Math.random() * 28) + 1}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{job.serviceName}</p>
                      <p className="text-xs text-slate-400 font-medium">Negotiated with {job.customerName}</p>
                    </div>
                 </div>
                 <div className="flex space-x-2">
                    <button 
                        onClick={() => updateBooking(job.id, BookingStatus.COMPLETED)}
                        className="text-xs font-black text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Mark Done
                    </button>
                 </div>
               </div>
             ))}
             {confirmedJobs.length === 0 && (
               <div className="p-12 text-center text-slate-400 font-bold italic">No active service agreements.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboardView;
