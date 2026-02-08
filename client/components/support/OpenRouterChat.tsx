import React, { useState, useRef } from 'react';
import { GroqChatResponse } from '@shared/api';

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

export function OpenRouterChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Welcome — I am here to listen and support you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const convoRef = useRef<Message[]>([]);

  // update ref whenever messages change
  React.useEffect(() => { convoRef.current = messages; }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

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
      setMessages(prev => [...prev, assistantMsg]);

      // Crisis handling
      if (json.isCrisis) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I am concerned. If you are thinking of harming yourself, please contact emergency services immediately or use a local helpline. In India call 9152987821, in US call 988.' }]);
      }

    } catch (err: any) {
      console.error('[GroqChat] send error', err);
      const message = err?.message;
      // Show friendly but informative error
      if (message && message.length < 200) {
        if (/No endpoints found/i.test(message) || /No endpoints/i.test(message)) {
          setError('AI model not available right now. Please try again in a few minutes.');
        } else {
          setError(`AI service error: ${message}`);
        }
      } else {
        setError('Sorry, something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="mb-3 text-sm text-foreground/80">Hello — I'm Claire's supportive companion. You can share how you're feeling. I'll listen and offer coping ideas.</div>
        <div className="space-y-3 max-h-72 overflow-y-auto p-2">
          {messages.filter(m => m.role !== 'system').map((m, idx) => (
            <div key={idx} className={`rounded-md p-2 ${m.role === 'user' ? 'bg-primary/10 self-end' : 'bg-gray-100'}`}>
              <div className="text-sm">{m.content}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-md border px-3 py-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
            disabled={loading}
          />
          <button className="rounded-md bg-primary px-4 py-2 text-white" onClick={sendMessage} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
