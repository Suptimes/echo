
export interface Profile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  summary: string;
  intentMatch: string;
  reasoning: string;
  userAction?: 'liked' | 'skipped' | 'saved';
}

export interface Datelist {
  id: string;
  title: string;
  mood: string;
  description: string;
  profiles: Profile[];
}

export interface UserCuratedSummary {
  description: string;
  currentMood: string;
  primaryIntent: string;
  interests: string[];
}

export interface Message {
  id: string;
  senderId: 'user' | string;
  text: string;
  timestamp: number;
}

export interface ChatConversation {
  profileId: string;
  messages: Message[];
  lastMessage?: string;
}

export interface UserSession {
  sessionId: string;
  voiceTranscript: string[];
  extractedTraits: string[];
  intents: string[];
  datelists: Datelist[];
  userSummary?: UserCuratedSummary;
  userImages?: string[];
  matches: Profile[];
  conversations: Record<string, ChatConversation>;
}

export type AppState = 'onboarding' | 'voice-session' | 'processing' | 'dashboard' | 'profile-detail' | 'edit-profile' | 'chat-session' | 'preview-profile';

export type VoiceMode = 'discovery' | 'profile';

export interface TranscriptionTurn {
  role: 'user' | 'model';
  text: string;
}
