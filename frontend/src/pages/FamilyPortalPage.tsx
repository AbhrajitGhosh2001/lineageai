import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, X, Send, Activity, CheckCircle, Users, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL || 'https://lineageai-copy-production.up.railway.app'}/api`;

interface PortalData {
  condition: string;
  testResult: string | null;
  testDate: string | null;
  familyMemberCount: number;
  testedCount: number;
  expiresAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function ChatBot({ condition, portalToken }: { condition: string; portalToken: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hi! I'm here to help you understand ${condition}. Ask me anything — about your risk, how testing works, what it means for your children, or prevention options.` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { message: userMsg, condition, portalToken });
      setMessages(m => [...m, { role: 'assistant', content: res.data.response }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50" style={{ height: 480 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-indigo-600 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white font-medium text-sm">Genetics Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about your risk…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={send} disabled={!input.trim() || loading} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Educational only — not medical advice</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function FamilyPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [optOutId, setOptOutId] = useState('');
  const [optOutDone, setOptOutDone] = useState(false);

  useEffect(() => {
    axios.get(`${API}/portal/${token}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'This link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleOptOut() {
    if (!optOutId.trim()) return;
    try {
      await axios.post(`${API}/family/${optOutId}/opt-out`, { reason: 'Self-requested via family portal' });
      setOptOutDone(true);
    } catch {
      alert('Could not process opt-out. Please contact your genetic counselor directly.');
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="font-bold text-gray-900 mb-2">Link Unavailable</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  if (!data) return null;

  const testedPct = data.familyMemberCount > 0
    ? Math.round((data.testedCount / data.familyMemberCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Lineage AI — Family Portal</div>
            <div className="text-xs text-gray-500">Secure · Private · HIPAA Compliant</div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3" /> Verified Link
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Your Family Has a Hereditary Risk</h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                A family member has been diagnosed with <strong>{data.condition}</strong>
                {data.testResult === 'positive' ? ' and tested positive for a hereditary mutation' : ''}.
                This means you may be at elevated risk. Knowing your status could save your life.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.familyMemberCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">At-risk relatives</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.testedCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Already tested</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`text-2xl font-bold ${testedPct >= 30 ? 'text-green-600' : 'text-amber-500'}`}>{testedPct}%</div>
            <div className="text-xs text-gray-500 mt-0.5">Family tested</div>
          </div>
        </div>

        {/* Why get tested */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> Why Get Tested Now
          </h2>
          <div className="space-y-3">
            {[
              { title: 'Early detection saves lives', desc: 'Catching hereditary cancer risk early means more treatment options and better outcomes.' },
              { title: 'Simple, painless test', desc: 'A saliva or blood sample is all it takes. Results in 2–4 weeks.' },
              { title: 'Often covered by insurance', desc: 'When a family member tests positive, most insurers cover cascade testing at little or no cost.' },
              { title: 'Protect your children too', desc: 'Knowing your status helps you make informed decisions for your children\'s future health.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-white">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> What To Do Next
          </h2>
          <ol className="space-y-2 text-sm text-indigo-100">
            <li className="flex gap-2"><span className="font-bold text-white">1.</span> Contact your genetic counselor — they will arrange your test.</li>
            <li className="flex gap-2"><span className="font-bold text-white">2.</span> Use the chat assistant below to learn more about your specific condition.</li>
            <li className="flex gap-2"><span className="font-bold text-white">3.</span> Share this link with other family members who may be at risk.</li>
          </ol>
          <p className="text-xs text-indigo-200 mt-4">This portal expires on {new Date(data.expiresAt).toLocaleDateString()}.</p>
        </div>

        {/* Opt-out */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-2 text-sm">Privacy & Opt-Out</h2>
          <p className="text-xs text-gray-500 mb-4">
            If you do not wish to be contacted about cascade testing, you can opt out permanently below.
            Your data will no longer be tracked on this platform.
          </p>
          {optOutDone ? (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
              You have been opted out. No further contact will be made.
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={optOutId}
                onChange={(e) => setOptOutId(e.target.value)}
                placeholder="Enter your member ID (provided by counselor)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button onClick={handleOptOut} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors whitespace-nowrap">
                Opt Out
              </button>
            </div>
          )}
        </div>
      </div>

      <ChatBot condition={data.condition} portalToken={token!} />

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 mt-12">
        <div className="max-w-2xl mx-auto px-4 text-center text-xs text-gray-400">
          <div className="mb-2">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Terms of Service</a>
            <span className="mx-2">·</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Privacy Policy</a>
          </div>
          <p>© 2026 Lineage AI · HIPAA Compliant</p>
        </div>
      </footer>
    </div>
  );
}
