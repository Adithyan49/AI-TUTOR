/**
 * AI Quantum Tutor Component
 * Features multi-turn chat, role-based system instructions, Google Search Grounding with citations,
 * model selection (gemini-3.8-flash / gemini-3.1-flash-lite), and Voice conversations with audio narration.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Circuit } from '../types/quantum';
import { TutorEngine, TutorMessage } from '../engine/tutorEngine';
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  GraduationCap,
  RotateCcw,
  User,
  ShieldCheck,
  Search,
  Volume2,
  VolumeX,
  ExternalLink,
  Mic,
  MicOff,
} from 'lucide-react';

interface TutorPanelProps {
  circuit: Circuit;
  learnerLevel: 'beginner' | 'intermediate' | 'advanced';
  onChangeLearnerLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  circuit,
  learnerLevel,
  onChangeLearnerLevel,
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'init_welcome',
      sender: 'tutor',
      text: `Hello! I am your **AI Quantum Tutor**. I am inspecting your current circuit **"${circuit.name}"** (${circuit.numQubits} qubits, ${circuit.gates.length} gates).\n\nFeel free to ask questions about superposition, entanglement, gate matrices, algorithms, or enable **Google Search Grounding** to query recent real-world quantum hardware milestones (like the Google Willow chip and IBM Heron)!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceLabel: 'Local Rule-Based Quantum Expert Engine',
      modelUsed: 'Local Quantum Rule Engine',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [engineMode, setEngineMode] = useState<'auto' | 'local' | 'gemini'>('auto');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt.trim();
    if (!prompt || isLoading) return;

    const userMsg: TutorMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await TutorEngine.queryTutor(
        prompt,
        circuit,
        learnerLevel,
        engineMode,
        [...messages, userMsg],
        {
          modelName: selectedModel,
          useSearchGrounding,
        }
      );

      const tutorMsg: TutorMessage = {
        id: `tutor_${Date.now()}`,
        sender: 'tutor',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceLabel:
          response.source === 'gemini'
            ? `Google Gemini AI (${response.model})${response.grounded ? ' • Search Grounded' : ''}`
            : 'Local Rule-Based Quantum Expert Engine',
        modelUsed: response.model,
        sources: response.sources,
        grounded: response.grounded,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch {
      const errorMsg: TutorMessage = {
        id: `tutor_err_${Date.now()}`,
        sender: 'tutor',
        text: 'An error occurred while generating tutoring response. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceLabel: 'Local Rule-Based Quantum Expert Engine',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (msg: TutorMessage) => {
    if (playingAudioId === msg.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    setAudioLoadingId(msg.id);
    try {
      const audioBase64 = await TutorEngine.generateSpeech(msg.text);
      if (audioBase64) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        currentAudioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        await audio.play();
        setPlayingAudioId(msg.id);
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    } finally {
      setAudioLoadingId(null);
    }
  };

  // Web Speech API Voice Recognition (browser native dictation)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        handleSendMessage(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const promptSuggestions = [
    'Explain my current circuit',
    'What did Google achieve with the Willow quantum chip?',
    'Why does a Hadamard gate create equal superposition?',
    'How does CNOT create entanglement?',
    'Why are Bell state outcomes correlated?',
    'What is the threshold for surface code error correction?',
  ];

  return (
    <div className="flex h-[750px] flex-col rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/60 p-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">AI Quantum Tutor</span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800">
                MULTI-TURN AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Contextual Quantum Computing Mentor</p>
          </div>
        </div>

        {/* Level, Engine & Model Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Depth selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1">
            <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
            <select
              value={learnerLevel}
              onChange={(e) => onChangeLearnerLevel(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none"
            >
              <option value="beginner">Beginner Depth</option>
              <option value="intermediate">Intermediate Depth</option>
              <option value="advanced">Advanced Depth</option>
            </select>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General/Reasoning)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>
          </div>

          {/* Google Search Grounding Toggle */}
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
              useSearchGrounding
                ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
            title="Ground answers with live Google Search for recent quantum breakthroughs"
          >
            <Search className="h-3 w-3" />
            <span>Search Grounding: {useSearchGrounding ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Circuit Context Card Pill */}
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-900/30 px-4 py-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>Active Context:</span>
          <strong className="text-slate-200">{circuit.name}</strong>
          <span>({circuit.numQubits} Qubits, {circuit.gates.length} Gates)</span>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `reset_${Date.now()}`,
                sender: 'tutor',
                text: 'Chat history cleared. How can I help you explore quantum algorithms today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sourceLabel: 'Local Rule-Based Quantum Expert Engine',
              },
            ])
          }
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
          title="Clear chat"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlayingThis = playingAudioId === msg.id;
          const isLoadingAudioThis = audioLoadingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-300">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs shadow-md ${
                  isUser
                    ? 'bg-cyan-600 text-slate-950 font-medium'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 leading-relaxed'
                }`}
              >
                {/* Message body with Markdown format support */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounding Source Citations (if returned from Google Search) */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                      <Search className="h-3 w-3" />
                      <span>Google Search Grounding Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] text-cyan-300 hover:bg-slate-800 border border-slate-800"
                        >
                          <span className="line-clamp-1 max-w-[140px]">{s.title}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls & Voice Audio Button */}
                {!isUser && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-500 font-mono">
                    <span className="text-cyan-400/90">{msg.sourceLabel}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        disabled={isLoadingAudioThis}
                        className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Listen to spoken audio explanation"
                      >
                        {isLoadingAudioThis ? (
                          <span>Synthesizing...</span>
                        ) : isPlayingThis ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-cyan-400">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-300">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs text-slate-400">
              {useSearchGrounding
                ? 'Querying real-world quantum scientific literature with Google Search Grounding...'
                : 'Reasoning about quantum state transformations with Gemini AI...'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Pills */}
      <div className="border-t border-slate-800/80 bg-slate-900/40 p-2.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:bg-slate-900 hover:text-cyan-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form with Voice Mic button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 p-3"
      >
        <button
          type="button"
          onClick={handleToggleVoiceInput}
          className={`flex items-center justify-center rounded-lg p-2 transition-all ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
          title={isRecording ? 'Listening (Click to stop)' : 'Speak prompt (Voice recognition)'}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={`Ask AI Quantum Tutor (${selectedModel}, ${useSearchGrounding ? 'Search Grounded' : 'Normal'})...`}
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="flex items-center justify-center rounded-lg bg-cyan-500 p-2 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-md shadow-cyan-500/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
