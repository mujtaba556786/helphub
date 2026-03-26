
import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface UserProfileViewProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await apiService.updateProfile(user.id, { name, bio, avatar: user.avatar });
    if (success) {
      onUpdate({ ...user, name, bio });
      alert("Profile updated successfully!");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
         <div className="flex flex-col items-center">
            <div className="relative group">
                <img src={user.avatar} className="w-32 h-32 rounded-[2.5rem] shadow-2xl border-4 border-white mb-4" alt="Profile" />
                <button className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    📸
                </button>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">{user.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{user.role} • {user.status}</p>
         </div>

         <div className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional Bio / About</label>
                <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-32" value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                {saving ? 'Syncing Profile...' : 'Save Profile Changes'}
            </button>
         </div>
      </div>
      
      <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Security</p>
            <p className="font-bold">Email Login Linked to {user.email}</p>
          </div>
          <button className="px-4 py-2 border border-white/20 rounded-xl text-xs font-black hover:bg-white/10 transition-colors">Sign Out</button>
      </div>
    </div>
  );
};

export default UserProfileView;
