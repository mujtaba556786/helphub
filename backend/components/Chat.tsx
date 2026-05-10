
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User } from '../types';
import { ICONS } from '../constants';

interface ChatProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  currentUser: User;
}

const ChatView: React.FC<ChatProps> = ({ conversations, setConversations, currentUser }) => {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(conversations[0] || null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedChat.id 
        ? { ...conv, messages: [...conv.messages, newMessage], lastMessage: inputText, lastTimestamp: 'Just now' }
        : conv
    ));

    setSelectedChat(prev => prev ? { 
        ...prev, 
        messages: [...prev.messages, newMessage],
        lastMessage: inputText,
        lastTimestamp: 'Just now'
    } : null);
    
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Conversation List */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-black text-slate-900">Inbox</h2>
          <div className="mt-4 relative">
             <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input placeholder="Search chats..." className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedChat(conv)}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center space-x-4 ${
                selectedChat?.id === conv.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white border border-transparent hover:border-slate-100'
              }`}
            >
              <img src={conv.participantAvatar} className="w-12 h-12 rounded-xl border border-white/20" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-sm truncate">{conv.participantName}</p>
                  <span className={`text-[10px] ${selectedChat?.id === conv.id ? 'text-indigo-100' : 'text-slate-400'}`}>{conv.lastTimestamp}</span>
                </div>
                <p className={`text-xs truncate ${selectedChat?.id === conv.id ? 'text-indigo-100' : 'text-slate-500'}`}>{conv.lastMessage}</p>
              </div>
            </div>
          ))}

          {/* Ad Placeholder */}
          <div className="mx-2 mt-4 p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sponsored</p>
             <div className="h-20 bg-slate-200 rounded flex items-center justify-center italic text-xs text-slate-400">Google Ad Placeholder</div>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img src={selectedChat.participantAvatar} className="w-12 h-12 rounded-2xl shadow-lg" alt="" />
                    <div>
                      <h3 className="font-black text-slate-900 leading-none mb-1">{selectedChat.participantName}</h3>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold text-slate-500">Ready to negotiate</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100"><ICONS.Bot className="w-5 h-5" /></button>
                  </div>
              </div>
              
              {/* Service Context Header */}
              {selectedChat.serviceContext && (
                <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 px-2">
                        <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Discussing:</span>
                        <span className="text-indigo-900 font-bold text-sm">{selectedChat.serviceContext}</span>
                    </div>
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">Private Negotiation</span>
                </div>
              )}
            </div>

            {/* Ad Banner Inside Chat */}
            <div className="px-8 pt-4">
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">Advertisement</span>
                    <p className="text-xs font-medium text-amber-700">Looking for tools? Visit our partner store for 20% off gardening equipment!</p>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
              {selectedChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                    msg.senderId === currentUser.id 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-2 font-bold ${msg.senderId === currentUser.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Location Sharing Hint */}
              <div className="flex justify-center">
                <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-4 py-1 rounded-full border border-slate-200">
                   Tip: Share your location only after finalizing the price.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Discuss price, timing, and location..." 
                    className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600" title="Share Location">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </button>
                </div>
                <button 
                  onClick={handleSendMessage}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col space-y-4">
            <ICONS.Chat className="w-16 h-16 opacity-20" />
            <p className="font-bold">Select a conversation to negotiate details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
