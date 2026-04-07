import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Mail, Phone, MessageSquare, FileText,
  CheckCircle, Clock, XCircle, AlertCircle, Send, Trash2, Edit2, X,
  Link2, TrendingUp, Copy, Check
} from 'lucide-react';
import api from '../lib/api';
import type { Patient, FamilyMember } from '../types';
import EpicWriteBack from '../components/EpicWriteBack';


const RELATIONSHIPS = ['parent', 'sibling', 'child', 'aunt', 'uncle', 'cousin', 'grandparent', 'other'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'not-contacted': { label: 'Not contacted', color: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300', icon: Clock },
  contacted:       { label: 'Contacted',     color: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', icon: Mail },
  scheduled:       { label: 'Scheduled',     color: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', icon: Clock },
  completed:       { label: 'Completed',     color: 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300', icon: CheckCircle },
  declined:        { label: 'Declined',      color: 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300', icon: XCircle },
};

const RESULT_BADGE: Record<string, string> = {
  positive: 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  negative: 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  variant:  'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
};

interface OutreachModalProps {
  member: FamilyMember;
  onClose: () => void;
  onSent: () => void;
}

function OutreachModal({ member, onClose, onSent }: OutreachModalProps) {
  const [method, setMethod] = useState('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      await api.post(`/family/${member.id}/outreach`, { method, message });
      onSent();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Send outreach to {member.firstName}</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Method</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'email', icon: Mail, label: 'Email' },
                { value: 'sms', icon: MessageSquare, label: 'SMS' },
                { value: 'phone', icon: Phone, label: 'Phone' },
                { value: 'letter', icon: FileText, label: 'Letter' },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-colors ${
                    method === m.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Personalized message for this family member…"
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>
          <button
            onClick={send}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending…' : 'Log outreach'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddMemberModalProps {
  patientId: string;
  onClose: () => void;
  onAdded: () => void;
}

function AddMemberModal({ patientId, onClose, onAdded }: AddMemberModalProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', relationship: 'sibling', email: '', phone: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/patients/${patientId}/family`, form);
      onAdded();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to add family member.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100";
  const labelCls = "block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Add at-risk relative</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>First name *</label><input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Last name *</label><input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required className={inputCls} /></div>
          </div>
          <div>
            <label className={labelCls}>Relationship *</label>
            <select value={form.relationship} onChange={(e) => update('relationship', e.target.value)} className={inputCls}>
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Phone</label><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Date of birth</label><input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} className={inputCls} /></div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {loading ? 'Adding…' : 'Add relative'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface UpdateStatusModalProps {
  member: FamilyMember;
  onClose: () => void;
  onUpdated: () => void;
}

function UpdateStatusModal({ member, onClose, onUpdated }: UpdateStatusModalProps) {
  const [testStatus, setTestStatus] = useState(member.testStatus);
  const [testResult, setTestResult] = useState(member.testResult ?? '');
  const [testDate, setTestDate] = useState(member.testDate ?? '');
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await api.put(`/patients/${member.patientId}/family/${member.id}`, { ...member, testStatus, testResult: testResult || undefined, testDate: testDate || undefined });
      onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100";
  const labelCls = "block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Update status — {member.firstName}</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Testing status</label>
            <select value={testStatus} onChange={(e) => setTestStatus(e.target.value)} className={inputCls}>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Test result</label>
            <select value={testResult} onChange={(e) => setTestResult(e.target.value)} className={inputCls}>
              <option value="">Unknown</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="variant">Variant of uncertain significance</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Test date</label>
            <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={inputCls} />
          </div>
          <button onClick={save} disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [outreachTarget, setOutreachTarget] = useState<FamilyMember | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [statusTarget, setStatusTarget] = useState<FamilyMember | null>(null);
  const [portalUrl, setPortalUrl] = useState('');
  const [portalCopied, setPortalCopied] = useState(false);
  const [riskScores, setRiskScores] = useState<(FamilyMember & { riskScore: number })[] | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'risk' | 'portal'>('members');

  async function load() {
    try {
      const r = await api.get(`/patients/${patientId}`);
      setPatient(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [patientId]);

  async function deletePatient() {
    if (!confirm('Delete this patient and all family records? This cannot be undone.')) return;
    await api.delete(`/patients/${patientId}`);
    navigate('/patients');
  }

  async function deleteMember(memberId: string) {
    if (!confirm('Remove this family member?')) return;
    await api.delete(`/patients/${patientId}/family/${memberId}`);
    load();
  }

  async function generatePortalLink() {
    const res = await api.post(`/patients/${patientId}/portal`);
    setPortalUrl(res.data.portalUrl);
  }

  async function copyPortalLink() {
    await navigator.clipboard.writeText(portalUrl);
    setPortalCopied(true);
    setTimeout(() => setPortalCopied(false), 2000);
  }

  async function loadRiskScores() {
    setRiskLoading(true);
    try {
      const res = await api.get(`/patients/${patientId}/risk-scores`);
      setRiskScores(res.data);
    } finally {
      setRiskLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!patient) return (
    <div className="text-center py-20 text-gray-500 dark:text-slate-400">Patient not found.</div>
  );

  const completed = patient.familyMembers.filter((m) => m.testStatus === 'completed').length;
  const cascadeRate = patient.familyMembers.length > 0
    ? Math.round((completed / patient.familyMembers.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {outreachTarget && <OutreachModal member={outreachTarget} onClose={() => setOutreachTarget(null)} onSent={load} />}
      {addingMember && <AddMemberModal patientId={patient.id} onClose={() => setAddingMember(false)} onAdded={load} />}
      {statusTarget && <UpdateStatusModal member={statusTarget} onClose={() => setStatusTarget(null)} onUpdated={load} />}

      {/* Header */}
      <div className="mb-6">
        <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{patient.firstName} {patient.lastName}</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{patient.condition}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {patient.testResult && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_BADGE[patient.testResult] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}>
                    {patient.testResult}
                  </span>
                )}
                {patient.testDate && <span className="text-xs text-gray-400 dark:text-slate-500">Tested {patient.testDate}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={deletePatient}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete patient
          </button>
        </div>
      </div>

      {/* Patient info + cascade rate */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 text-sm">Patient Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Email', value: patient.email },
              { label: 'Phone', value: patient.phone },
              { label: 'Date of birth', value: patient.dateOfBirth },
              { label: 'At-risk relatives', value: patient.familyMembers.length.toString() },
            ].map((f) => f.value ? (
              <div key={f.label}>
                <div className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{f.label}</div>
                <div className="text-gray-900 dark:text-slate-100">{f.value}</div>
              </div>
            ) : null)}
          </div>
          {patient.notes && (
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Clinical notes</div>
              <p className="text-sm text-gray-700 dark:text-slate-300">{patient.notes}</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
            <EpicWriteBack
              patientId={patient.id}
              condition={patient.condition}
              testResult={patient.testResult}
              testDate={patient.testDate}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col items-center justify-center text-center">
          <div className={`text-4xl font-bold mb-1 ${cascadeRate >= 30 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {cascadeRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400">Cascade rate</div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Industry: 30%</div>
          <div className={`mt-3 text-xs font-medium px-2 py-1 rounded-full ${cascadeRate >= 30 ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
            {cascadeRate >= 30 ? 'Above baseline' : 'Below baseline'}
          </div>
        </div>
      </div>

      {/* Tabbed section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
          {([
            { id: 'members', label: 'At-Risk Relatives', icon: Plus },
            { id: 'risk', label: 'Priority Outreach', icon: TrendingUp },
            { id: 'portal', label: 'Family Portal', icon: Link2 },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'risk' && !riskScores) loadRiskScores(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Members tab header */}
        {activeTab === 'members' && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">At-Risk Relatives</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{patient.familyMembers.length} family members tracked</p>
          </div>
          <button
            onClick={() => setAddingMember(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add relative
          </button>
        </div>
        )}

        {/* Risk Scoring Tab */}
        {activeTab === 'risk' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Priority Outreach Order</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Ranked by age, relationship, and test status</p>
              </div>
              <button onClick={loadRiskScores} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Recalculate</button>
            </div>
            {riskLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : riskScores && riskScores.length > 0 ? (
              <div className="space-y-2">
                {riskScores.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-slate-700 rounded-xl">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                      : i === 1 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                    }`}>#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{m.firstName} {m.lastName}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 capitalize">{m.relationship} · {m.testStatus.replace('-', ' ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.riskScore >= 70 ? 'bg-red-500' : m.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${m.riskScore}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-8 text-right ${m.riskScore >= 70 ? 'text-red-600 dark:text-red-400' : m.riskScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                        {m.riskScore}
                      </span>
                    </div>
                    <button onClick={() => setOutreachTarget(m as FamilyMember)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40 transition-colors">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No family members to score yet.
              </div>
            )}
          </div>
        )}

        {/* Portal Tab */}
        {activeTab === 'portal' && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Family Sharing Portal</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
              Generate a secure link the proband can share with their family via WhatsApp, iMessage, or email.
              The portal shows condition info, an AI chatbot, and an opt-out option — no login required.
            </p>
            {!portalUrl ? (
              <button
                onClick={generatePortalLink}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Link2 className="w-4 h-4" /> Generate Family Portal Link
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Portal link generated — valid for 30 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-300 truncate">
                      {portalUrl}
                    </code>
                    <button onClick={copyPortalLink} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors whitespace-nowrap">
                      {portalCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  {[
                    { label: 'Share via WhatsApp', emoji: '💬', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Your family has a hereditary health risk. Learn more and get tested: ${portalUrl}`)}`) },
                    { label: 'Share via Email', emoji: '📧', action: () => window.open(`mailto:?subject=Important family health information&body=${encodeURIComponent(`A family member has shared important genetic health information with you.\n\nPlease visit: ${portalUrl}`)}`) },
                    { label: 'Copy Link', emoji: '🔗', action: copyPortalLink },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action} className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-xl p-3 transition-colors">
                      <div className="text-xl mb-1">{btn.emoji}</div>
                      <div className="text-gray-600 dark:text-slate-300">{btn.label}</div>
                    </button>
                  ))}
                </div>
                <button onClick={generatePortalLink} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Generate new link
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && patient.familyMembers.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">No at-risk relatives added yet.</p>
            <button onClick={() => setAddingMember(true)} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Add first relative
            </button>
          </div>
        ) : activeTab === 'members' && (
          <div className="space-y-3">
            {patient.familyMembers.map((member) => {
              const statusCfg = STATUS_CONFIG[member.testStatus] ?? STATUS_CONFIG['not-contacted'];
              const StatusIcon = statusCfg.icon;
              return (
                <div key={member.id} className="border border-gray-100 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-slate-300 font-medium text-sm flex-shrink-0">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-slate-100 text-sm">{member.firstName} {member.lastName}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{member.relationship}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />{statusCfg.label}
                        </span>
                        {member.testResult && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_BADGE[member.testResult] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}>
                            {member.testResult}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-slate-500 flex-wrap">
                        {member.email && <span>{member.email}</span>}
                        {member.phone && <span>{member.phone}</span>}
                        {member.outreaches.length > 0 && <span>{member.outreaches.length} outreach{member.outreaches.length !== 1 ? 'es' : ''} sent</span>}
                      </div>
                      {member.outreaches.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {member.outreaches.slice(0, 3).map((o) => (
                            <div key={o.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-2.5 py-1.5">
                              <span className="capitalize font-medium text-gray-700 dark:text-slate-300">{o.method}</span>
                              <span>·</span>
                              <span className={`font-medium ${o.status === 'responded' ? 'text-green-600 dark:text-green-400' : o.status === 'sent' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>{o.status}</span>
                              <span>·</span>
                              <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setStatusTarget(member)} title="Update status" className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setOutreachTarget(member)} title="Send outreach" className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMember(member.id)} title="Remove" className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
