
import React, { useState, useMemo } from 'react';
import { Datelist, Profile, UserCuratedSummary, VoiceMode, ChatConversation } from '../types';
import { Icons, COLORS } from '../constants';

interface DatelistDashboardProps {
  datelists: Datelist[];
  matches: Profile[];
  conversations: Record<string, ChatConversation>;
  onSelectProfile: (profile: Profile) => void;
  onStartVoice: (mode: VoiceMode) => void;
  onEditProfile: () => void;
  onOpenChat: (profile: Profile) => void;
  userSummary?: UserCuratedSummary;
}

export const DatelistDashboard: React.FC<DatelistDashboardProps> = ({ 
  datelists, 
  matches,
  conversations,
  onSelectProfile, 
  onStartVoice, 
  onEditProfile,
  onOpenChat,
  userSummary 
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'chats' | 'library'>('home');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const HomeView = () => (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Header */}
      <header className="px-6 pt-6 flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight">{greeting}</h2>
        <div className="flex space-x-3">
          <button className="text-zinc-400 hover:text-white transition-colors" onClick={() => setActiveTab('search')}><Icons.Search /></button>
        </div>
      </header>

      {/* Hero: User Bio / Profile Mode */}
      <section className="px-6">
        <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl group active:scale-[0.98] transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-zinc-900 to-zinc-900" />
          <div className="relative p-6 space-y-4">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Your Echo Profile</span>
               <button 
                onClick={onEditProfile}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
               </button>
            </div>
            <p className="text-sm font-medium leading-relaxed text-zinc-200">
              {userSummary?.description || "You haven't shared your story with Echo yet."}
            </p>
            {userSummary?.interests && (
              <div className="flex flex-wrap gap-2">
                {userSummary.interests.map((int, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-zinc-400 border border-white/5">{int}</span>
                ))}
              </div>
            )}
            <button 
              onClick={onEditProfile}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              Edit Profile & Photos →
            </button>
          </div>
        </div>
      </section>

      {/* Discovery Mode Card */}
      <section className="px-6">
        <div 
          onClick={() => onStartVoice('discovery')}
          className="p-6 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-800 relative overflow-hidden group cursor-pointer shadow-xl active:scale-95 transition-transform"
        >
          <div className="relative z-10 space-y-1">
            <h3 className="text-xl font-black">Find your next Vibe</h3>
            <p className="text-xs text-white/80 font-medium">Talk to Echo to generate new curated Datelists for your current mood.</p>
            <div className="mt-4 inline-flex items-center space-x-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <Icons.Mic />
               <span className="text-[10px] font-black uppercase tracking-widest">Start Discovery</span>
            </div>
          </div>
          <div className="absolute top-1/2 right-[-20px] -translate-y-1/2 opacity-20 scale-150 group-hover:scale-[1.7] transition-transform duration-700">
             <Icons.Mic />
          </div>
        </div>
      </section>

      {/* Main Datelists */}
      {datelists.map((list) => (
        <section key={list.id} className="space-y-4">
          <div className="px-6 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-black text-white">{list.title}</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{list.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-5 overflow-x-auto pb-6 no-scrollbar px-6">
            {list.profiles.map((profile) => (
              <div 
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="flex-shrink-0 w-44 space-y-3 group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 shadow-xl ring-1 ring-white/10">
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <div className="px-2 py-1 bg-white/10 backdrop-blur-lg rounded text-[9px] font-black text-white uppercase border border-white/20">
                       {profile.intentMatch} Match
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white group-hover:text-pink-400 transition-colors">{profile.name}, {profile.age}</h3>
                  <p className="text-[10px] text-zinc-400 font-medium line-clamp-2 leading-relaxed">{profile.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="px-6 pb-24 pt-4 text-center">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Curated by Echo AI</p>
      </footer>
    </div>
  );

  const SearchView = () => (
    <div className="p-6 space-y-8 pb-32 animate-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black tracking-tight">Search</h1>
      
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-pink-500 transition-colors">
          <Icons.Search />
        </div>
        <input 
          type="text" 
          placeholder="Moods, intents, energy..." 
          className="w-full bg-zinc-900 text-white py-4 pl-12 pr-4 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder:text-zinc-600" 
        />
      </div>

      {/* Voice Search Prompt */}
      <section>
        <div 
          onClick={() => onStartVoice('discovery')}
          className="p-5 rounded-2xl bg-zinc-900 border border-white/5 flex items-center space-x-4 cursor-pointer hover:bg-zinc-800/80 transition-colors group active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Icons.Mic />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-white">Search with Echo</h3>
            <p className="text-[11px] font-medium text-zinc-500">Don't know what you want? Let the AI curate for you.</p>
          </div>
          <div className="text-zinc-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Serious Dating', color: 'bg-rose-600', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
            { title: 'Casual Fun', color: 'bg-indigo-600', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200' },
            { title: 'New City', color: 'bg-emerald-600', img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=200' },
            { title: 'Deep Talk', color: 'bg-amber-600', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=200' },
          ].map((cat) => (
            <div 
              key={cat.title} 
              className={`aspect-video rounded-xl relative overflow-hidden group cursor-pointer shadow-lg active:scale-95 transition-transform ${cat.color}`}
            >
              <img src={cat.img} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
              <span className="absolute top-3 left-3 text-sm font-black text-white leading-tight pr-4">{cat.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const ChatsView = () => (
    <div className="p-6 space-y-8 pb-32 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight">Chats</h1>
        <div className="flex items-center space-x-2 bg-pink-600/10 px-3 py-1.5 rounded-full border border-pink-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase text-pink-500 tracking-widest">{matches.length} Matches</span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 space-y-6">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-600">
            <Icons.Message />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-300">No matches yet</h2>
            <p className="text-xs text-zinc-500 px-10 leading-relaxed">Like profiles in your curated Datelists to start a conversation with Echo.</p>
          </div>
          <button 
            onClick={() => setActiveTab('home')}
            className="px-8 py-3 bg-white text-black text-xs font-black rounded-full hover:scale-105 transition-transform"
          >
            Explore Datelists
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Chats List */}
          {matches.map(profile => {
            const conv = conversations[profile.id];
            return (
              <div 
                key={profile.id} 
                onClick={() => onOpenChat(profile)}
                className="flex items-center space-x-4 group cursor-pointer active:opacity-70 transition-opacity"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-pink-500/30 transition-colors">
                    <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name} />
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#121212] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-pink-500 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 border-b border-white/5 pb-4 group-last:border-none">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-sm text-white group-hover:text-pink-400 transition-colors truncate">{profile.name}</h3>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Just now</span>
                  </div>
                  <p className="text-[11px] font-medium text-zinc-500 truncate leading-relaxed">
                    {conv?.lastMessage || `Start the conversation with ${profile.name}...`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const LibraryView = () => (
    <div className="p-6 space-y-6 pb-32 animate-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black tracking-tight">Your History</h1>
      <div className="space-y-4">
        {datelists.map(list => (
          <div key={list.id} className="flex items-center space-x-4 group cursor-pointer active:opacity-70 transition-opacity">
            <div className="w-16 h-16 bg-zinc-800 rounded shadow-lg overflow-hidden flex-shrink-0">
               <img src={list.profiles[0]?.avatar} className="w-full h-full object-cover" alt={list.title} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-zinc-100 group-hover:text-pink-500 transition-colors">{list.title}</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{list.profiles.length} potential matches</p>
            </div>
            <div className="text-zinc-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'search' && <SearchView />}
        {activeTab === 'chats' && <ChatsView />}
        {activeTab === 'library' && <LibraryView />}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-6 flex justify-between items-center z-50 ring-1 ring-white/5 backdrop-blur-sm">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'home' ? 'text-white' : 'text-zinc-500'}`}>
          <div className={activeTab === 'home' ? 'scale-110' : ''}><Icons.Home /></div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'search' ? 'text-white' : 'text-zinc-500'}`}>
          <div className={activeTab === 'search' ? 'scale-110' : ''}><Icons.Search /></div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Search</span>
        </button>
        <button onClick={() => setActiveTab('chats')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'chats' ? 'text-white' : 'text-zinc-500'}`}>
          <div className={activeTab === 'chats' ? 'scale-110' : ''}><Icons.Message /></div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Chats</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'library' ? 'text-white' : 'text-zinc-500'}`}>
          <div className={activeTab === 'library' ? 'scale-110' : ''}><Icons.Library /></div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">History</span>
        </button>
      </nav>
    </div>
  );
};
