
import React, { useState } from 'react';
import { UserSession } from '../types';
import { Icons } from '../constants';

interface PublicProfilePreviewProps {
  session: UserSession;
  onBack: () => void;
  onEdit: () => void;
}

export const PublicProfilePreview: React.FC<PublicProfilePreviewProps> = ({ session, onBack, onEdit }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { userSummary, userImages = [] } = session;

  const displayImages = userImages.length > 0 ? userImages : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button onClick={onBack} className="p-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
          <Icons.ChevronLeft />
        </button>
        <button onClick={onEdit} className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 text-xs font-black uppercase tracking-widest">
          Edit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Profile Visuals */}
        <div className="relative aspect-[4/5] w-full bg-zinc-900 group">
          <img 
            src={displayImages[activeImageIdx]} 
            className="w-full h-full object-cover transition-all duration-700"
            alt="Your Profile"
          />
          
          {/* Image Navigation Taps */}
          <div className="absolute inset-0 flex">
            <div className="flex-1" onClick={() => setActiveImageIdx(prev => Math.max(0, prev - 1))} />
            <div className="flex-1" onClick={() => setActiveImageIdx(prev => Math.min(displayImages.length - 1, prev + 1))} />
          </div>

          {/* Progress Indicators */}
          <div className="absolute top-4 left-6 right-6 flex space-x-1.5 z-10">
            {displayImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === activeImageIdx ? 'bg-white' : 'bg-white/20'}`}
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent">
            <h1 className="text-4xl font-black">You, 25</h1>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-3 py-1 bg-pink-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {userSummary?.primaryIntent || 'Discovery'}
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {userSummary?.currentMood || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-8 space-y-10 pb-20 mt-6">
          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">The Story Echo Found</h2>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                 <Icons.Mic />
               </div>
               <p className="text-lg font-medium leading-relaxed italic text-zinc-100">
                 "{userSummary?.description || 'Talk to Echo to generate your story...'}"
               </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Vibe</h2>
            <div className="flex flex-wrap gap-2">
              {(userSummary?.interests || ['Curious', 'Open-minded']).map(tag => (
                <span key={tag} className="px-4 py-2 bg-zinc-800/50 border border-white/5 rounded-full text-xs font-bold text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <div className="pt-10 pb-10 text-center">
             <div className="inline-block p-4 rounded-full bg-zinc-900 border border-white/5">
                <Icons.Mic />
             </div>
             <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Verified by Echo AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};
