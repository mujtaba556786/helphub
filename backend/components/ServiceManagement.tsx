
import React, { useState } from 'react';
import { Service } from '../types';
import { ICONS } from '../constants';
import { suggestServiceDescription } from '../services/geminiService';
import { apiService } from '../services/api';

interface ServiceManagementProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const SECTORS = ['Home', 'Care', 'Transport', 'Wellness', 'Skills'];

const emptyForm = { name: '', category: 'Home', icon: '📦', description: '', status: 'Active' as const };

const ServiceManagementView: React.FC<ServiceManagementProps> = ({ services, setServices }) => {
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ ...emptyForm });

  // Edit modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const handleSuggest = async (serviceName: string) => {
    setLoadingSuggestion(serviceName);
    const desc = await suggestServiceDescription(serviceName);
    alert(`AI Suggestion for ${serviceName}:\n\n"${desc}"`);
    setLoadingSuggestion(null);
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const serviceToCreate: Service = {
      ...newService,
      id: Date.now().toString(),
      providerCount: 0,
      status: 'Active'
    };
    const success = await apiService.createService(serviceToCreate);
    setSaving(false);
    if (success) {
      setServices(prev => [...prev, serviceToCreate]);
      setShowAddModal(false);
      setNewService({ ...emptyForm });
    } else {
      alert('Database error. Check server.js console.');
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const openEdit = (service: Service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      category: service.category || 'Home',
      icon: service.icon || '📦',
      description: service.description || '',
      status: service.status || 'Active'
    });
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSaving(true);
    const success = await apiService.updateService(editingService.id, editForm);
    setSaving(false);
    if (success) {
      setServices(prev =>
        prev.map(s => s.id === editingService.id ? { ...s, ...editForm } : s)
      );
      setEditingService(null);
    } else {
      alert('Could not save changes. Check server console.');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    const success = await apiService.deleteService(service.id);
    if (success) {
      setServices(prev => prev.filter(s => s.id !== service.id));
      if (editingService?.id === service.id) setEditingService(null);
    }
  };

  // ── Shared modal shell ────────────────────────────────────────────────────────
  const Modal = ({
    title, subtitle, onClose, onSubmit, form, setForm, submitLabel
  }: {
    title: string; subtitle: string; onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    form: typeof emptyForm; setForm: (f: typeof emptyForm) => void;
    submitLabel: string;
  }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-indigo-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-black italic tracking-tighter">{title}</h3>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"/>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Service Label</label>
              <input
                required
                placeholder="Ex: HVAC Repair"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Symbol (Emoji)</label>
              <input
                required
                placeholder="🔧"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all text-center text-2xl"
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Industry Sector</label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Status</label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all h-28"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the target audience and value of this service..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <button type="button" onClick={onClose} className="w-full py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all">
              Discard
            </button>
            <button type="submit" disabled={saving} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
              {saving ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Marketplace Inventory</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Service Orchestration &amp; Taxonomy</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <ICONS.Plus className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-widest">New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Identity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Sector</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Experts</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Briefing</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Orchestrate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-300">
                      {service.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight">{service.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {service.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {service.category}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <p className="text-sm font-black text-slate-800">{service.providerCount}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Active Providers</p>
                </td>
                <td className="px-8 py-5 max-w-xs">
                  <p className="text-xs text-slate-500 italic line-clamp-2 font-medium leading-relaxed">
                    {service.description || 'No description provided.'}
                  </p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}/>
                    <span className={`text-[10px] font-black uppercase ${service.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                      {service.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleSuggest(service.name)}
                      disabled={loadingSuggestion === service.name}
                      className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      title="AI Description Suggestion"
                    >
                      {loadingSuggestion === service.name ? (
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
                      ) : (
                        <ICONS.Bot className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(service)}
                      className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      title="Edit Category"
                    >
                      <ICONS.Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                      title="Delete Category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="p-20 text-center">
            <ICONS.Services className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No service categories found.</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
              Add First Category
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          title="Category Launch"
          subtitle="Expanding the Marketplace Horizon"
          onClose={() => { setShowAddModal(false); setNewService({ ...emptyForm }); }}
          onSubmit={handleAddService}
          form={newService}
          setForm={setNewService}
          submitLabel="Publish Category"
        />
      )}

      {/* Edit Modal */}
      {editingService && (
        <Modal
          title="Edit Category"
          subtitle={`Updating: ${editingService.name}`}
          onClose={() => setEditingService(null)}
          onSubmit={handleEditService}
          form={editForm}
          setForm={setEditForm}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
};

export default ServiceManagementView;
