import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Building,
  Wrench,
  Shield,
  Search,
} from 'lucide-react';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { ChatMessage } from '../../types';

export const MessagesView: React.FC = () => {
  const currentUser = auth.getCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>(db.chatMessages);
  const [activeChannel, setActiveChannel] = useState<'conv_tkt_001' | 'conv_general' | 'conv_emergency'>('conv_tkt_001');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => setMessages([...db.chatMessages]);
    const unsub = db.subscribe(refresh);
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const currentChannelMessages = messages.filter((m) => m.conversation_id === activeChannel);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: activeChannel,
      sender_id: currentUser?.id || 'usr_guest',
      sender_name: currentUser?.name || 'Guest User',
      sender_role: currentUser?.role || 'tenant',
      message: inputText.trim(),
      created_at: new Date().toISOString(),
      read: true,
    };

    db.chatMessages.push(newMsg);
    db.saveToStorage();
    setMessages([...db.chatMessages]);
    setInputText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Operations Communications Desk
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Instant multi-party operational chat between tenants, property managers, and facilities engineers
        </p>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
        {/* Channel Sidebar */}
        <div className="border-r border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Active Channels</h2>

          <div
            onClick={() => setActiveChannel('conv_tkt_001')}
            className={`p-3 rounded-xl cursor-pointer transition flex items-start gap-3 ${
              activeChannel === 'conv_tkt_001'
                ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Shop G-14 Leak</span>
                <span className="text-[10px] text-red-600 font-bold">Live</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Nandi, Sipho & Bheki
              </p>
            </div>
          </div>

          <div
            onClick={() => setActiveChannel('conv_general')}
            className={`p-3 rounded-xl cursor-pointer transition flex items-start gap-3 ${
              activeChannel === 'conv_general'
                ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Building className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">General Management</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Centre Office Desk
              </p>
            </div>
          </div>

          <div
            onClick={() => setActiveChannel('conv_emergency')}
            className={`p-3 rounded-xl cursor-pointer transition flex items-start gap-3 ${
              activeChannel === 'conv_emergency'
                ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Security Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Control Room 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Chat Feed & Input */}
        <div className="md:col-span-2 flex flex-col justify-between h-full min-h-[500px]">
          {/* Channel Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeChannel === 'conv_tkt_001'
                  ? 'Shop G-14 (Emergency Water Leak)'
                  : activeChannel === 'conv_general'
                  ? 'General Management Desk'
                  : 'Security & Control Room'}
              </h2>
              <span className="text-[10px] text-slate-400">
                End-to-end synchronized • Umhlaba Wami Operations
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[380px]">
            {currentChannelMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No messages yet in this channel. Send the first message below.
              </div>
            ) : (
              currentChannelMessages.map((m) => {
                const isMe = m.sender_id === currentUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {m.sender_name}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-bold">
                        {m.sender_role}
                      </span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-xs'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type message to operations team..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
