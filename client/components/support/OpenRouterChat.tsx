import React, { useState, useRef, useEffect } from 'react';
import { GroqChatResponse } from '@shared/api';
import { UserCircle, Bot, Maximize2, Minimize2 } from 'lucide-react';

type Message = { role: 'user' | 'assistant' | 'system'; content: string; isTyping?: boolean };

export function OpenRouterChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Welcome — I am here to listen and support you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const convoRef = useRef<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  }, [messages]);

  // Auto-focus input when loading completes
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [loading]);

  // update ref whenever messages change
  React.useEffect(() => { convoRef.current = messages; }, [messages]);

  // Crisis detection helper
  const detectCrisis = (text: string): boolean => {
    const crisisKeywords = [
      'suicide',
      'kill myself',
      'want to die',
      'end my life',
      'self harm',
      'hurt myself',
      'taking my life',
      'no reason to live',
      'better off dead',
      'commit suicide'
    ];
    
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    
    // Client-side crisis detection
    if (detectCrisis(userMsg.content)) {
      console.log('[CrisisDetection] High-risk content detected - bypassing API');
      
      // Add crisis support response immediately without calling API
      const crisisResponse: Message = {
        role: 'assistant',
        content: "I'm really sorry that you're feeling this much pain. You don't have to go through this alone. It might help to talk to someone you trust or a mental health professional. If you're in immediate danger, please contact local emergency services or a crisis helpline right now."
      };
      setMessages(prev => [...prev, crisisResponse]);
      
      // Add additional helpline info
      setTimeout(() => {
        const helplineMsg: Message = {
          role: 'assistant',
          content: 'Crisis helplines: In India call 9152987821, in US call 988, in UK call 116 123 (Samaritans).'
        };
        setMessages(prev => [...prev, helplineMsg]);
      }, 500);
      
      return;
    }

    setLoading(true);

    // Add typing indicator
    const typingMsg: Message = { role: 'assistant', content: 'Claire is thinking…', isTyping: true };
    setMessages(prev => [...prev, typingMsg]);

    try {
      const payload = { conversation: newMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })), message: userMsg.content };
      const res = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('[OpenRouterChat] server responded with non-ok status', res.status, txt);
        // try to parse json if possible
        try {
          const parsed = JSON.parse(txt);
          throw new Error(parsed?.details || parsed?.error || txt || 'Server error');
        } catch (parseErr) {
          throw new Error(txt || 'Server error');
        }
      }

      const json: GroqChatResponse = await res.json();
      const ai = json.content || 'Sorry, I did not understand that.';
      const assistantMsg: Message = { role: 'assistant', content: ai };
      
      // Remove typing indicator and add real response
      setMessages(prev => [...prev.filter(m => !m.isTyping), assistantMsg]);

      // Crisis handling
      if (json.isCrisis) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I am concerned. If you are thinking of harming yourself, please contact emergency services immediately or use a local helpline. In India call 9152987821, in US call 988.' }]);
      }

    } catch (err: any) {
      // Log error for debugging but don't expose technical details to user
      console.error('[GroqChat] API request failed:', err);
      
      // Remove typing indicator and append fallback assistant message to preserve chat flow
      const fallbackMsg: Message = { 
        role: 'assistant', 
        content: "I'm here to listen. If I'm ever slow to respond, please know your feelings still matter. Would you like to share more?" 
      };
      setMessages(prev => [...prev.filter(m => !m.isTyping), fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full h-full max-w-5xl flex flex-col bg-white rounded-lg shadow-2xl">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between p-4 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Claire Support Chat</h3>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Exit fullscreen"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Fullscreen Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
              {messages.filter(m => m.role !== 'system').map((m, idx) => (
                <div key={idx} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse items-start' : 'items-start'}`}>
                  <div className="flex-shrink-0">
                    {m.role === 'user' ? (
                      <UserCircle className="w-8 h-8 text-primary" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className={`rounded-md p-3 max-w-[75%] ${m.role === 'user' ? 'bg-primary/10' : 'bg-gray-100'}`}>
                    <div className={`text-sm ${m.isTyping ? 'animate-pulse italic text-muted-foreground' : ''}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Fullscreen Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 rounded-md border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Share what's on your mind..."
                  onKeyDown={e => { if (e.key === 'Enter' && !loading) { e.preventDefault(); sendMessage(); } }}
                  disabled={loading}
                />
                <button 
                  className="rounded-md bg-primary px-4 py-2 text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={sendMessage} 
                  disabled={loading}
                >
                  {loading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normal View */}
      <div className="max-w-3xl">
        {showDisclaimer && (
          <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            <strong>Disclaimer:</strong> This AI support tool is not a replacement for professional therapy. If you are in crisis or need urgent help, contact local emergency services immediately.
            <div className="mt-2">
              <button className="text-xs text-primary underline" onClick={() => setShowDisclaimer(false)}>Dismiss</button>
            </div>
          </div>
        )}

        <div className="mb-4 rounded-lg border bg-white p-4">
          {/* Chat Header with Maximize Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-foreground/80">Hello — I'm Claire's supportive companion. You can share how you're feeling. I'll listen and offer coping ideas.</div>
            <button 
              onClick={() => setIsFullscreen(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto p-2" ref={messagesContainerRef}>
          {messages.filter(m => m.role !== 'system').map((m, idx) => (
            <div key={idx} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse items-start' : 'items-start'}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {m.role === 'user' ? (
                  <UserCircle className="w-8 h-8 text-primary" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              
              {/* Message bubble */}
              <div className={`rounded-md p-3 max-w-[75%] sm:max-w-[80%] ${m.role === 'user' ? 'bg-primary/10' : 'bg-gray-100'}`}>
                <div className={`text-sm ${m.isTyping ? 'animate-pulse italic text-muted-foreground' : ''}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            className="flex-1 rounded-md border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            onKeyDown={e => { if (e.key === 'Enter' && !loading) { e.preventDefault(); sendMessage(); } }}
            disabled={loading}
          />
          <button 
            className="rounded-md bg-primary px-4 py-2 text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={sendMessage} 
            disabled={loading}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
