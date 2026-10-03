import React, { useState, useRef, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  X,
  Bot,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Flame,
  Droplets,
  Truck,
  Palette,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export const AIChatHelper: React.FC = () => {
  const { language } = useMarketplace();
  const { currentUser, userStore } = useAuth();
  const isRTL = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: isRTL
        ? 'أهلاً بك في قلب الخرسانة! أنا المساعد الذكي المدعوم بنموذج Google Gemini (3.8 Flash). كيف يمكنني مساعدتك في القطع الفنية الخرسانية، المباخر المعمارية المقاومة للحرارة، صواني التيرازو، أو العناية بالخرسانة والطلبات المخصصة؟'
        : 'Salam! I am your architectural art concierge powered by Google Gemini (3.8 Flash). Ask me anything about our brutalist concrete pieces, heat-resistant mabkharas, terrazzo casting, care instructions, or bespoke commissions across KSA, UAE, and Egypt!',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setErrorMessage(null);

    try {
      // Build conversation history for multi-turn Gemini reasoning
      const historyPayload = messages
        .filter(m => !m.isError)
        .slice(-6)
        .map(m => ({
          sender: m.sender,
          text: m.text,
        }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          context: {
            language,
            userRole: currentUser?.role || 'visitor',
            userStore: userStore?.name || null,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.reply || 'I processed your inquiry but received an empty response. Please ask again.';

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Gemini chat request failed:', err);
      const errMsg = err?.message || 'Connection error. Please try again.';
      setErrorMessage(errMsg);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: isRTL
            ? `عذراً، حدث خطأ أثناء الاتصال بمحرك Gemini: ${errMsg}`
            : `I encountered an issue connecting to Gemini: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: isRTL
          ? 'تم بدء محادثة جديدة مع Gemini 3.8 Flash! ما الذي تود معرفته عن قطع الخرسانة المعمارية اليوم؟'
          : 'Conversation cleared! How can Gemini assist you with our architectural concrete collection today?',
        timestamp: 'Just now',
      },
    ]);
    setErrorMessage(null);
  };

  // Helper to format markdown-like text from Gemini (bolding, lists)
  const formatAiText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const content = line.trim().replace(/^[\*\•\-]\s*/, '');
        return (
          <li key={idx} className="ml-3 list-disc my-0.5">
            {renderBoldText(content)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-0.5">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-stone-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Gemini AI Concierge"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-stone-900 hover:bg-stone-800 text-stone-100 p-3 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border-2 border-stone-300 flex items-center gap-2.5 group transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-black tracking-tight text-white flex items-center gap-1">
            <span>Gemini AI</span>
            <span className="text-[9px] bg-blue-500/30 text-blue-200 border border-blue-400/40 px-1 py-0.2 rounded font-mono">
              3.8 Flash
            </span>
          </div>
          <div className="text-[10px] text-stone-400 font-medium">
            {isRTL ? 'اسأل الذكاء الاصطناعي' : 'Ask Architecture Concierge'}
          </div>
        </div>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-22 right-4 sm:right-6 z-50 w-full max-w-[360px] sm:max-w-[420px] h-[550px] bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans backdrop-blur-md animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-[#EDE8E1] border-b border-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Gemini AI Concierge
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold px-1.5 py-0.5 rounded-full border border-blue-200">
                    3.8 Flash
                  </span>
                </div>
                <p className="text-[10px] text-stone-600 font-medium flex items-center gap-1">
                  <span>Reads & answers live with Google GenAI</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-stone-200/60 border-b border-stone-300 flex items-center gap-1.5 overflow-x-auto text-[10px] font-semibold text-stone-700 no-scrollbar">
            <button
              onClick={() => handleSend(isRTL ? 'كيف أعتني بصواني ومباخر الخرسانة المعمارية؟' : 'How do I care for and seal concrete trays and mabkharas?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-600 cursor-pointer transition flex items-center gap-1 shadow-2xs"
            >
              <Droplets className="w-3 h-3 text-blue-600" />
              <span>{isRTL ? 'العناية والتنظيف' : 'Care & Sealants'}</span>
            </button>
            <button
              onClick={() => handleSend(isRTL ? 'ما هي مواصفات مباخر الخرسانة المقاومة للحرارة؟' : 'What makes your concrete mabkhara heat-resistant?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-600 cursor-pointer transition flex items-center gap-1 shadow-2xs"
            >
              <Flame className="w-3 h-3 text-amber-600" />
              <span>{isRTL ? 'المباخر والحرارة' : 'Mabkhara Heat'}</span>
            </button>
            <button
              onClick={() => handleSend(isRTL ? 'كيف يعمل الدفع عند الاستلام والشحن في السعودية والإمارات ومصر؟' : 'How does Cash on Delivery work in KSA, UAE, and Egypt?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-600 cursor-pointer transition flex items-center gap-1 shadow-2xs"
            >
              <Truck className="w-3 h-3 text-emerald-600" />
              <span>{isRTL ? 'الشحن والدفع' : 'Shipping & COD'}</span>
            </button>
            <button
              onClick={() => handleSend(isRTL ? 'كيف يمكنني طلب خلطة ألوان تيرازو مخصصة أو نقش خط عربي؟' : 'Can I order a custom terrazzo color mix or engraved Arabic calligraphy?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:border-stone-600 cursor-pointer transition flex items-center gap-1 shadow-2xs"
            >
              <Palette className="w-3 h-3 text-purple-600" />
              <span>{isRTL ? 'طلب مخصص' : 'Bespoke Orders'}</span>
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
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                  }`}
                >
                  {msg.sender === 'ai' ? (
                    <div className="space-y-1">
                      {formatAiText(msg.text)}
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-stone-400 font-mono">
                  {msg.sender === 'ai' && (
                    <span className="text-blue-600 font-bold">Gemini •</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-600 w-fit shadow-xs">
                <div className="w-4 h-4 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600 animate-spin" />
                </div>
                <span className="text-[11px] font-bold text-stone-500">
                  {isRTL ? 'Gemini يقرأ ويجيب الآن...' : 'Gemini is reading & answering...'}
                </span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-200"></span>
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="px-3 py-1.5 bg-red-100/80 border-t border-red-200 text-red-800 text-[10px] flex items-center justify-between">
              <span className="truncate">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-900 font-bold ml-2 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#EDE8E1] border-t border-stone-300 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isRTL ? 'اسأل Gemini عن أي قطعة خرسانية...' : 'Ask Gemini anything about concrete art...'}
              className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-sm flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
