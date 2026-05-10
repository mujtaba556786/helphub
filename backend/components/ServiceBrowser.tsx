
import React, { useState } from 'react';
import { Service, User, Booking, BookingStatus } from '../types';
import { ICONS } from '../constants';

interface ServiceBrowserProps {
  services: Service[];
  providers: User[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const ServiceBrowserView: React.FC<ServiceBrowserProps> = ({ services, providers, setBookings }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingProvider, setBookingProvider] = useState<User | null>(null);

  const handleStartChat = () => {
    if (!bookingProvider || !selectedService) return;
    
    const newBooking: Booking = {
      id: 'B' + Math.floor(Math.random() * 10000),
      customerId: '4', 
      customerName: 'David Doe',
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      serviceName: selectedService.name,
      date: new Date().toISOString().split('T')[0],
      status: BookingStatus.PENDING
    };

    setBookings(prev => [newBooking, ...prev]);
    alert(`Inquiry sent to ${bookingProvider.name}! Open Messages to discuss pricing and location privately.`);
    setBookingProvider(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
      {!selectedService ? (
        <>
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Find Your Service Hero</h2>
                <p className="text-lg font-medium text-slate-500">Negotiate privately. Agree on costs and location via chat.</p>
            </div>
            
            {/* Promo Ad */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                    <div className="z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Sponsor Offer</span>
                        <h3 className="text-3xl font-black mt-2 mb-4 italic">Home Improvement Sale</h3>
                        <p className="text-indigo-200 font-medium max-w-sm">Save big on tools and equipment through our partner links.</p>
                        <button className="mt-6 px-8 py-3 bg-white text-indigo-900 rounded-2xl font-black hover:scale-105 transition-all">Visit Partner</button>
                    </div>
                    <div className="mt-8 md:mt-0 text-7xl opacity-20">🔨</div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-32 -mt-32 opacity-50"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(service => (
                <div 
                    key={service.id} 
                    onClick={() => setSelectedService(service)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group"
                >
                    <div className="text-6xl mb-8 bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                    {service.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{service.name}</h3>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{service.description}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest">
                            {service.providerCount} Experts
                        </span>
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                            →
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </>
      ) : (
        <div className="space-y-8">
            <button 
                onClick={() => setSelectedService(null)}
                className="flex items-center space-x-2 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-indigo-600"
            >
                <span>← Back to Categories</span>
            </button>
            <div className="flex items-center space-x-6">
                <div className="text-5xl">{selectedService.icon}</div>
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedService.name} Experts</h2>
                    <p className="text-slate-500 font-medium">Chat directly to agree on the service fee and location.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.map(provider => (
                    <div key={provider.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 flex-1">
                            <div className="flex items-center space-x-4 mb-6">
                                <img src={provider.avatar} className="w-16 h-16 rounded-2xl shadow-xl border-4 border-white" alt="" />
                                <div>
                                    <h4 className="font-black text-slate-900 leading-none mb-1">{provider.name}</h4>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-amber-400 text-xs">★</span>
                                        <span className="text-xs font-black text-slate-900">{provider.rating}</span>
                                        <span className="text-xs font-bold text-slate-400">({provider.completedJobs})</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed italic line-clamp-2">"{provider.bio}"</p>
                            
                            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                                    <span className="text-sm font-bold text-slate-900">Negotiable</span>
                                </div>
                                <button 
                                  onClick={() => setBookingProvider(provider)}
                                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
                                >
                                    Start Chat
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Negotiation Confirmation Modal */}
      {bookingProvider && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-indigo-600 p-8 text-white">
                      <h3 className="text-2xl font-black mb-1">Contact Expert</h3>
                      <p className="text-indigo-100 font-medium">Start negotiation for {selectedService.name}</p>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-600 leading-relaxed text-center italic">
                            "Hi {bookingProvider.name}, I found your profile for {selectedService.name}. Can we discuss the timing and your price for this job?"
                          </p>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 font-medium italic">Costs and location must be finalized privately in the chat.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setBookingProvider(null)}
                            className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200"
                        >
                            Back
                        </button>
                        <button 
                            onClick={handleStartChat}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all"
                        >
                            Open Chat
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ServiceBrowserView;
