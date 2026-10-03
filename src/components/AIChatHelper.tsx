import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Minimize2, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const KNOWLEDGE_RESPONSES: Record<string, string> = {
  mabkhara: 'Our artisanal concrete incense burners (Mabkhara) are cast with heat-resistant refractory concrete and cured with mineral silicates. For safety, use natural bamboo charcoal discs with an insulated brass ash dish inside the vessel. Clean with a dry microfiber brush; avoid acidic cleansers.',
  care: 'Concrete Homeware Care Guidelines:\n1. Wipe spills (coffee, perfume, wax) immediately with a damp cloth.\n2. Do NOT use acidic chemicals, vinegar, or abrasive steel wool.\n3. All pieces feature food-safe water-repellent siloxane sealing.\n4. Apply beeswax balm once every 6 months to maintain a rich, tactile satin patina.',
  shipping: 'We provide expedited white-glove Cash on Delivery (COD) across the GCC and Egypt:\n• Saudi Arabia (Riyadh, Jeddah, Dammam): 2-4 business days.\n• UAE (Dubai, Abu Dhabi): 2-3 business days.\n• Egypt (Cairo, Giza, Alexandria): 3-5 business days.\nEach heavy concrete piece is packed in custom impact-absorbing foam packaging.',
  custom: 'Looking for a bespoke commission? You can use the "Custom Commission" feature in the navigation to request custom mineral pigments (Desert Sand, Alabaster White, Charcoal Basalt, Terracotta, Olive Green), inlaid brass Arabic calligraphy, or bespoke table dimensions directly from our ateliers!',
  terrazzo: 'Our terrazzo pieces are crafted by hand-seeding natural marble, alabaster, and volcanic basalt aggregate chips into the wet cementitious matrix, followed by diamond-pad grinding and honing to reveal the organic stone geometry.',
};

export const AIChatHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Salam! I am the Qalb Al-Kharasana AI Art Concierge. How may I assist you with brutalist concrete homeware, bespoke commissions, care instructions, or shipping across KSA, UAE, and Egypt?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart AI concierge reasoning
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = '';

      if (lower.includes('mabkhara') || lower.includes('incense') || lower.includes('burn') || lower.includes('heat') || lower.includes('بخور') || lower.includes('مبخرة')) {
        reply = KNOWLEDGE_RESPONSES.mabkhara;
      } else if (lower.includes('clean') || lower.includes('care') || lower.includes('wash') || lower.includes('stain') || lower.includes('seal') || lower.includes('عناية')) {
        reply = KNOWLEDGE_RESPONSES.care;
      } else if (lower.includes('ship') || lower.includes('cod') || lower.includes('deliver') || lower.includes('riyadh') || lower.includes('dubai') || lower.includes('cairo') || lower.includes('توصيل') || lower.includes('شحن')) {
        reply = KNOWLEDGE_RESPONSES.shipping;
      } else if (lower.includes('custom') || lower.includes('bespoke') || lower.includes('engrav') || lower.includes('commission') || lower.includes('طلب خاص')) {
        reply = KNOWLEDGE_RESPONSES.custom;
      } else if (lower.includes('terrazzo') || lower.includes('marble') || lower.includes('aggregate') || lower.includes('تيرازو')) {
        reply = KNOWLEDGE_RESPONSES.terrazzo;
      } else {
        reply = `Thank you for your inquiry about "${userText}". All our concrete home art pieces are cast by independent verified artisans across the Arab world with mineral pigments and industrial sealants. If you require a tailored solution or price quotation, you can also click "Request Callback" on any artisan's storefront page!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 650);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Concierge"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-stone-900 hover:bg-stone-800 text-stone-100 p-3.5 rounded-2xl shadow-2xl border-2 border-stone-300 flex items-center gap-2 group transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="text-xs font-bold font-sans hidden sm:inline text-stone-100">
          Chat with AI
        </span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-22 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md h-[520px] bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans backdrop-blur-md animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="p-4 bg-[#EDE8E1] border-b border-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-stone-900">AI Concierge</h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full border border-blue-200">
                    Pryzm AI
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-medium">
                  Concrete Architecture & Artisan Knowledge
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-stone-200/50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[10px] font-semibold text-stone-600 no-scrollbar">
            <button
              onClick={() => setInputText('How do I care for concrete trays and vessels?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-500 cursor-pointer transition"
            >
              Care & Cleaning
            </button>
            <button
              onClick={() => setInputText('How does Cash on Delivery work in KSA and UAE?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-500 cursor-pointer transition"
            >
              Shipping & COD
            </button>
            <button
              onClick={() => setInputText('Can I order a custom terrazzo color blend?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-500 cursor-pointer transition"
            >
              Bespoke Colors
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F5F0]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-white rounded-br-xs'
                      : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-400 w-24">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-200"></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-[#EDE8E1] border-t border-stone-300 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about concrete art..."
              className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
