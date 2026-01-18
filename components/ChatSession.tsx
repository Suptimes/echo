
import React, { useState, useRef, useEffect } from 'react';
import { Profile, Message } from '../types';
import { Icons } from '../constants';

interface ChatSessionProps {
  profile: Profile;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

export const ChatSession: React.FC<ChatSessionProps> = ({ profile, messages, onSendMessage, onBack }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      {/* Header */}
      <header className="p-4 flex items-center space-x-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Icons.ChevronLeft />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-sm font-black">{profile.name}</h2>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active now</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gradient-to-b from-zinc-900/20 to-black/20"
      >
        <div className="text-center py-10 space-y-2">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-pink-500/30">
            <img src={profile.avatar} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Matched on Echo</p>
          <p className="text-[10px] text-zinc-600 px-10 leading-relaxed italic">
            "You both value {profile.reasoning.split(' ').slice(0, 3).join(' ')}..."
          </p>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div 
              className={`max-w-[75%] p-3.5 rounded-2xl text-sm font-medium leading-relaxed
                ${msg.senderId === 'user' 
                  ? 'bg-pink-600 text-white rounded-tr-none' 
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center space-x-3 bg-zinc-800 rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-pink-500/50 transition-all">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none placeholder:text-zinc-600 py-2"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 text-pink-500 disabled:text-zinc-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
