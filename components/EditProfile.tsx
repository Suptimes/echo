
import React, { useState, useRef, useEffect } from 'react';
import { UserCuratedSummary, VoiceMode } from '../types';
import { Icons } from '../constants';

interface EditProfileProps {
  summary: UserCuratedSummary | undefined;
  images: string[];
  onSave: (updatedSummary: UserCuratedSummary, updatedImages: string[]) => void;
  onCancel: () => void;
  onStartEcho: () => void;
  onPreview: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ 
  summary, 
  images: initialImages, 
  onSave, 
  onCancel, 
  onStartEcho,
  onPreview
}) => {
  const [bio, setBio] = useState(summary?.description || '');
  const [images, setImages] = useState<string[]>(initialImages);
  const [interests, setInterests] = useState<string[]>(summary?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand bio textarea
  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = 'auto';
      bioRef.current.style.height = bioRef.current.scrollHeight + 'px';
    }
  }, [bio]);

  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compressing to 70% quality
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages = [...images];
    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 6) break;
      const optimized = await optimizeImage(files[i]);
      newImages.push(optimized);
    }
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
      e.preventDefault();
    }
  };

  const removeInterest = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
  };

  const handleSave = () => {
    const updatedSummary: UserCuratedSummary = {
      ...(summary || { currentMood: 'Active', primaryIntent: 'Networking', interests: [] }),
      description: bio,
      interests: interests,
    };
    onSave(updatedSummary, images);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 bg-[#121212] z-20">
        <button onClick={onCancel} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
        <h1 className="text-lg font-black tracking-tight">Edit Profile</h1>
        <button onClick={handleSave} className="text-sm font-bold text-pink-500 hover:text-pink-400 transition-colors">Save</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar pb-32">
        {/* Preview Button Section */}
        <section>
          <button 
            onClick={onPreview}
            className="w-full py-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center space-x-3 group active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">See your profile</span>
          </button>
        </section>

        {/* Photo Grid */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Your Photos</h2>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-lg bg-zinc-800 border-2 border-dashed border-white/5 overflow-hidden flex items-center justify-center group">
                {images[idx] ? (
                  <>
                    <img src={images[idx]} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icons.X />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageAdd} 
            className="hidden" 
            accept="image/*" 
            multiple 
          />
        </section>

        {/* Bio Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">About You</h2>
            <button 
              onClick={onStartEcho}
              className="flex items-center space-x-1 text-[10px] font-black uppercase text-pink-500 hover:text-pink-400 transition-colors bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20"
            >
              <Icons.Mic />
              <span>Refine with Echo</span>
            </button>
          </div>
          <div className="relative group">
            <textarea 
              ref={bioRef}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-zinc-800/50 border border-white/5 rounded-xl p-4 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all overflow-hidden"
              placeholder="Tell your story..."
              rows={1}
            />
          </div>
        </section>

        {/* Live Status Display */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Live Context</h2>
          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.1em]">Current Mood</span>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[11px] text-pink-500 font-black uppercase tracking-widest">{summary?.currentMood || 'Discovery Mode'}</span>
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.1em]">Primary Intent</span>
              <span className="text-[11px] text-zinc-200 font-black uppercase tracking-widest">{summary?.primaryIntent || 'Social'}</span>
            </div>
          </div>
        </section>

        {/* Interests / Tags Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Your Vibe (Tags)</h2>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {interests.map((tag) => (
              <div 
                key={tag} 
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 border border-white/5 rounded-full text-xs font-bold text-zinc-300 group"
              >
                <span>{tag}</span>
                <button 
                  onClick={() => removeInterest(tag)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
            ))}
            <input 
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={handleAddInterest}
              className="bg-transparent border border-zinc-800 rounded-full px-4 py-1 text-xs focus:outline-none focus:border-zinc-700 w-32 font-bold placeholder:text-zinc-600"
              placeholder="+ Add Interest"
            />
          </div>
        </section>
      </div>
    </div>
  );
};
