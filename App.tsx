
import React, { useState } from 'react';
import { AppState, UserSession, Profile, VoiceMode, UserCuratedSummary, Message, ChatConversation } from './types';
import { VoiceSession } from './components/VoiceSession';
import { DatelistDashboard } from './components/DatelistDashboard';
import { ProfileDetail } from './components/ProfileDetail';
import { EditProfile } from './components/EditProfile';
import { ChatSession } from './components/ChatSession';
import { PublicProfilePreview } from './components/PublicProfilePreview';
import { processTranscriptToDatelists, processTranscriptToBio } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [activeVoiceMode, setActiveVoiceMode] = useState<VoiceMode>('discovery');
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeChatProfile, setActiveChatProfile] = useState<Profile | null>(null);

  const handleStartVoice = (mode: VoiceMode) => {
    setActiveVoiceMode(mode);
    setAppState('voice-session');
  };

  const handleEditProfile = () => {
    setAppState('edit-profile');
  };

  const handlePreviewProfile = () => {
    if (session) {
      setAppState('preview-profile');
    }
  };

  const handleSaveProfile = (updatedSummary: UserCuratedSummary, updatedImages: string[]) => {
    setSession(prev => prev ? {
      ...prev,
      userSummary: updatedSummary,
      userImages: updatedImages
    } : null);
    setAppState('dashboard');
  };

  const handleVoiceSessionComplete = async (transcript: string) => {
    setAppState('processing');
    
    if (activeVoiceMode === 'discovery') {
      const result = await processTranscriptToDatelists(transcript);
      setSession(prev => ({
        sessionId: prev?.sessionId || Math.random().toString(36).substring(7),
        voiceTranscript: [...(prev?.voiceTranscript || []), transcript],
        extractedTraits: result.traits,
        intents: result.intents,
        datelists: result.datelists,
        userSummary: result.userSummary,
        userImages: prev?.userImages || [],
        matches: prev?.matches || [],
        conversations: prev?.conversations || {}
      }));
    } else {
      const result = await processTranscriptToBio(transcript);
      setSession(prev => prev ? {
        ...prev,
        userSummary: result
      } : {
        sessionId: Math.random().toString(36).substring(7),
        voiceTranscript: [transcript],
        extractedTraits: [],
        intents: [],
        datelists: [],
        userSummary: result,
        userImages: [],
        matches: [],
        conversations: {}
      });
    }
    
    setAppState('dashboard');
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setAppState('profile-detail');
  };

  const handleProfileAction = (action: 'liked' | 'skipped' | 'saved') => {
    if (action === 'liked' && selectedProfile) {
      setSession(prev => {
        if (!prev) return null;
        // Avoid duplicates
        if (prev.matches.some(m => m.id === selectedProfile.id)) return prev;
        
        return {
          ...prev,
          matches: [selectedProfile, ...prev.matches],
          conversations: {
            ...prev.conversations,
            [selectedProfile.id]: {
              profileId: selectedProfile.id,
              messages: []
            }
          }
        };
      });
    }
    setAppState('dashboard');
    setSelectedProfile(null);
  };

  const handleOpenChat = (profile: Profile) => {
    setActiveChatProfile(profile);
    setAppState('chat-session');
  };

  const handleSendMessage = (text: string) => {
    if (!session || !activeChatProfile) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: 'user',
      text,
      timestamp: Date.now()
    };

    setSession(prev => {
      if (!prev) return null;
      const conv = prev.conversations[activeChatProfile.id] || { profileId: activeChatProfile.id, messages: [] };
      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [activeChatProfile.id]: {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: text
          }
        }
      };
    });

    // Simulate Echo Match Response
    setTimeout(() => {
      const responseText = `Hey! Echo suggested we'd vibe over "${activeChatProfile.reasoning.split(' ').slice(0, 3).join(' ')}". How's your day going?`;
      const responseMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: activeChatProfile.id,
        text: responseText,
        timestamp: Date.now()
      };
      
      setSession(prev => {
        if (!prev) return null;
        const conv = prev.conversations[activeChatProfile.id];
        return {
          ...prev,
          conversations: {
            ...prev.conversations,
            [activeChatProfile.id]: {
              ...conv,
              messages: [...conv.messages, responseMsg],
              lastMessage: responseText
            }
          }
        };
      });
    }, 1500);
  };

  if (appState === 'onboarding') {
    return (
      <div className="flex flex-col h-full bg-[#121212] text-white p-8 justify-center items-center text-center space-y-12">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-pink-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(219,39,119,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-tight">Meet via<br/><span className="text-pink-600">Conversation</span></h1>
          <p className="text-zinc-400 text-lg font-medium px-4">Stop swiping. Start talking. Echo curates your world based on real intent.</p>
        </div>
        <button 
          onClick={() => handleStartVoice('discovery')}
          className="w-full max-w-sm py-5 bg-white text-black rounded-full text-xl font-black hover:scale-105 transition-transform"
        >
          Start Voice Onboarding
        </button>
      </div>
    );
  }

  if (appState === 'voice-session') {
    return <VoiceSession mode={activeVoiceMode} onComplete={handleVoiceSessionComplete} />;
  }

  if (appState === 'edit-profile') {
    return (
      <EditProfile 
        summary={session?.userSummary} 
        images={session?.userImages || []} 
        onSave={handleSaveProfile}
        onCancel={() => setAppState('dashboard')}
        onStartEcho={() => handleStartVoice('profile')}
        onPreview={handlePreviewProfile}
      />
    );
  }

  if (appState === 'preview-profile' && session) {
    return (
      <PublicProfilePreview 
        session={session} 
        onBack={() => setAppState('dashboard')}
        onEdit={() => setAppState('edit-profile')}
      />
    );
  }

  if (appState === 'chat-session' && activeChatProfile) {
    return (
      <ChatSession 
        profile={activeChatProfile}
        messages={session?.conversations[activeChatProfile.id]?.messages || []}
        onSendMessage={handleSendMessage}
        onBack={() => setAppState('dashboard')}
      />
    );
  }

  if (appState === 'processing') {
    return (
      <div className="flex flex-col h-full bg-[#121212] text-white p-8 justify-center items-center text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-pink-500/20 rounded-full" />
          <div className="absolute top-0 w-32 h-32 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <h2 className="text-2xl font-bold">{activeVoiceMode === 'discovery' ? 'Curating Datelists...' : 'Updating Profile...'}</h2>
      </div>
    );
  }

  if (appState === 'dashboard' && session) {
    return (
      <DatelistDashboard 
        datelists={session.datelists} 
        matches={session.matches}
        conversations={session.conversations}
        onSelectProfile={handleSelectProfile} 
        onStartVoice={handleStartVoice}
        onEditProfile={handleEditProfile}
        onOpenChat={handleOpenChat}
        userSummary={session.userSummary}
      />
    );
  }

  if (appState === 'profile-detail' && selectedProfile) {
    return (
      <ProfileDetail profile={selectedProfile} onBack={() => setAppState('dashboard')} onAction={handleProfileAction} />
    );
  }

  return null;
};

export default App;
