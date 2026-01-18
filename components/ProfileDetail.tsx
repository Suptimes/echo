
import React from 'react';
import { Profile } from '../types';
import { Icons } from '../constants';

interface ProfileDetailProps {
  profile: Profile;
  onBack: () => void;
  onAction: (action: 'liked' | 'skipped' | 'saved') => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, onBack, onAction }) => {
  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      {/* Sticky Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="p-2 bg-black/40 backdrop-blur-md rounded-full">
          <Icons.ChevronLeft />
        </button>
        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full">
          <Icons.Bookmark />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Image */}
        <div className="relative aspect-[4/5] w-full bg-zinc-900">
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent">
            <h1 className="text-4xl font-black">{profile.name}, {profile.age}</h1>
            <p className="text-pink-500 font-bold uppercase tracking-tighter text-sm mt-1">
              {profile.intentMatch} Alignment
            </p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-8 space-y-8 pb-40">
          {/* Why Curated */}
          <div className="p-5 rounded-2xl bg-zinc-800/50 border border-white/5 space-y-3">
             <div className="flex items-center space-x-2 text-zinc-400">
               <span className="text-xs font-bold tracking-widest uppercase">Curator Note</span>
             </div>
             <p className="text-lg font-medium leading-relaxed italic text-zinc-200">
               "{profile.reasoning}"
             </p>
          </div>

          {/* Personality */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Personality</h2>
            <p className="text-lg leading-relaxed">{profile.summary}</p>
          </section>

          {/* Interest Chips */}
          <div className="flex flex-wrap gap-2">
            {['Music', 'Art', 'Coffee', 'Nature'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-semibold text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 left-0 right-0 px-8 flex justify-center items-center space-x-6 z-20">
        <button 
          onClick={() => onAction('skipped')}
          className="w-16 h-16 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
        >
          <Icons.X />
        </button>
        <button 
          onClick={() => onAction('liked')}
          className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_30px_rgba(233,30,99,0.4)]"
        >
          <Icons.Heart />
        </button>
        <button 
          onClick={() => onAction('saved')}
          className="w-16 h-16 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
        >
          <Icons.Bookmark />
        </button>
      </div>
    </div>
  );
};
