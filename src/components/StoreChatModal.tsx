import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, StoreMessage } from '../types';
import { sendStoreMessage, subscribeStoreMessages } from '../services/storeService';
import { MessageSquare, Send, X, ShieldCheck, User, Store as StoreIcon } from 'lucide-react';

export const StoreChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}> = ({ isOpen, onClose, store }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !store.id) return;
    const unsubscribe = subscribeStoreMessages(store.id, msgs => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [isOpen, store.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const isArtisan = currentUser?.id === store.vendorId || currentUser?.storeId === store.id;

    setSending(true);
    try {
      await sendStoreMessage(store.id, {
        storeId: store.id,
        customerId: isArtisan ? undefined : (currentUser?.id || 'guest_user'),
        senderId: currentUser?.id || 'anonymous',
        senderName: currentUser?.displayName || (isArtisan ? store.name : 'Customer'),
        senderRole: isArtisan ? 'artisan' : 'customer',
        text: inputText.trim(),
      });
      setInputText('');
    } catch (e) {
      console.warn('Failed to send store message:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-lg w-full h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-4 bg-[#EDE8E1] border-b border-stone-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-300 bg-white">
              <img
                src={store.logoUrl || '/logo.svg'}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-stone-900 leading-tight">
                  {store.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Live Artisan Direct Messaging • {store.city}, {store.country}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F5F0]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-stone-300 stroke-[1.5]" />
              <div className="text-xs font-bold text-stone-600">No Messages Yet</div>
              <p className="text-[11px] text-stone-500 max-w-xs">
                Ask {store.name} about custom dimensions, concrete sealing, aggregate samples, or shipping timeline.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === currentUser?.id;
              const isArtisanMessage = msg.senderRole === 'artisan';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-1 px-1">
                    <span className="text-[10px] font-bold text-stone-500">
                      {msg.senderName}
                    </span>
                    {isArtisanMessage && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full border border-blue-200">
                        Atelier
                      </span>
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-stone-900 text-white rounded-br-xs'
                        : isArtisanMessage
                        ? 'bg-blue-50 text-blue-950 border border-blue-200 rounded-bl-xs'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#EDE8E1] border-t border-stone-300 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Message ${store.name}...`}
            className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
