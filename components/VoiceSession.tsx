
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Icons } from '../constants';
import { TranscriptionTurn, VoiceMode } from '../types';

interface VoiceSessionProps {
  mode: VoiceMode;
  onComplete: (transcript: string) => void;
}

export const VoiceSession: React.FC<VoiceSessionProps> = ({ mode, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [turns, setTurns] = useState<TranscriptionTurn[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY || '' }));
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptRef = useRef<string[]>([]);
  
  const getInitialMessage = () => {
    if (mode === 'discovery') {
      return "I'm ready to find someone for you. What's your current vibe? Who are you in the mood to meet today?";
    }
    return "Let's update your story. What should others know about you today? Tell me about your passions or what you've been up to lately.";
  };

  const getSystemInstruction = () => {
    if (mode === 'discovery') {
      return "You are Echo's Discovery Specialist. Your goal is to understand the user's current mood and social intent to curate 'Datelists'. Ask about their energy level, what kind of interaction they want, and any specific vibes they are chasing.";
    }
    return "You are Echo's Profile Architect. Your goal is to help the user articulate their best self for their public bio. Ask about their interests, unique quirks, and what makes them a desirable match. Help them sound pleasant and authentic.";
  };

  // Audio Utilities
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const startSession = async () => {
    if (isActive) return;
    setIsActive(true);
    setTurns([{ role: 'model', text: getInitialMessage() }]);

    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;

    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = aiRef.current.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => {
              s.sendRealtimeInput({
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
            const buffer = await decodeAudioData(decode(base64), outputCtx, 24000);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
            source.start(nextStartTime);
            nextStartTime += buffer.duration;
            sources.add(source);
          }
          if (msg.serverContent?.outputTranscription) {
             const text = msg.serverContent.outputTranscription.text;
             setTurns(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                return [...prev, { role: 'model', text }];
             });
             transcriptRef.current.push(`Echo: ${text}`);
          }
          if (msg.serverContent?.inputTranscription) {
            const text = msg.serverContent.inputTranscription.text;
            setTurns(prev => {
               const last = prev[prev.length - 1];
               if (last?.role === 'user') return [...prev.slice(0, -1), { ...last, text: last.text + text }];
               return [...prev, { role: 'user', text }];
            });
            transcriptRef.current.push(`User: ${text}`);
          }
          if (msg.serverContent?.interrupted) {
            sources.forEach(s => s.stop());
            sources.clear();
            nextStartTime = 0;
          }
        },
        onerror: (e) => console.error("Session Error", e),
        onclose: () => console.log("Session Closed")
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: getSystemInstruction(),
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const handleFinish = () => {
    setIsFinishing(true);
    if (sessionRef.current) sessionRef.current.close();
    onComplete(transcriptRef.current.join('\n'));
  };

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">{mode === 'discovery' ? 'Finding Matches' : 'Updating Bio'}</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">Live AI Audio</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {turns.map((turn, i) => (
          <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${turn.role === 'user' ? 'bg-pink-600 rounded-tr-none' : 'bg-zinc-800 rounded-tl-none border border-white/5'}`}>
              <p className="text-sm font-medium leading-relaxed">{turn.text}</p>
            </div>
          </div>
        ))}
        {isFinishing && (
          <div className="flex justify-center p-4">
             <div className="flex space-x-1"><div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" /><div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" /></div>
          </div>
        )}
      </div>
      <div className="p-8 bg-gradient-to-t from-black to-transparent space-y-4">
        <div className="flex justify-center items-center">
           <button 
             onClick={handleFinish}
             disabled={isFinishing}
             className="px-12 py-4 bg-white text-black rounded-full font-black hover:scale-105 transition-transform disabled:opacity-50 shadow-xl"
           >
             {mode === 'discovery' ? 'Find Matches' : 'Update Profile'}
           </button>
        </div>
      </div>
    </div>
  );
};
