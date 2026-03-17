import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Mail, Phone, MessageSquare, FileText,
  CheckCircle, Clock, XCircle, AlertCircle, Send, Trash2, Edit2, X
} from 'lucide-react';
import api from '../lib/api';
import type { Patient, FamilyMember } from '../types';

const RELATIONSHIPS = ['parent', 'sibling', 'child', 'aunt', 'uncle', 'cousin', 'grandparent', 'other'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'not-contacted': { label: 'Not contacted', color: 'bg-gray-100 text-gray-600', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-amber-50 text-amber-700', icon: Mail },
  scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-50 text-red-700', icon: XCircle },
};

const RESULT_BADGE: Record<string, string> = {
  positive: 'bg-red-50 text-red-700',
  negative: 'bg-green-50 text-green-700',
  variant: 'bg-amber-50 text-amber-700',
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Send outreach to {member.firstName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
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
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Personalized message for this family member…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
  const [form, setForm] = useState({
    firstName: '', lastName: '', relationship: 'sibling',
    email: '', phone: '', dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Add at-risk relative</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First name *</label>
              <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last name *</label>
              <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Relationship *</label>
            <select value={form.relationship} onChange={(e) => update('relationship', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date of birth</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
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
      await api.put(`/patients/${member.patientId}/family/${member.id}`, {
        ...member,
        testStatus,
        testResult: testResult || undefined,
        testDate: testDate || undefined,
      });
      onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Update status — {member.firstName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Testing status</label>
            <select value={testStatus} onChange={(e) => setTestStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="not-contacted">Not contacted</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          {testStatus === 'completed' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Test result</label>
                <select value={testResult} onChange={(e) => setTestResult(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select…</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="variant">Variant of uncertain significance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Test date</label>
                <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </>
          )}
          <button onClick={save} disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [outreachTarget, setOutreachTarget] = useState<FamilyMember | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [statusTarget, setStatusTarget] = useState<FamilyMember | null>(null);

  async function load() {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function deletePatient() {
    if (!confirm('Delete this patient and all associated data? This cannot be undone.')) return;
    await api.delete(`/patients/${id}`);
    navigate('/patients');
  }

  async function deleteMember(memberId: string) {
    if (!confirm('Remove this family member?')) return;
    await api.delete(`/patients/${id}/family/${memberId}`);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Patient not found.</p>
        <Link to="/patients" className="text-indigo-600 text-sm mt-2 inline-block">Back to patients</Link>
      </div>
    );
  }

  const cascadeRate = patient.familyMembers.length > 0
    ? Math.round((patient.familyMembers.filter(m => m.testStatus === 'completed').length / patient.familyMembers.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Modals */}
      {outreachTarget && (
        <OutreachModal member={outreachTarget} onClose={() => setOutreachTarget(null)} onSent={load} />
      )}
      {addingMember && (
        <AddMemberModal patientId={patient.id} onClose={() => setAddingMember(false)} onAdded={load} />
      )}
      {statusTarget && (
        <UpdateStatusModal member={statusTarget} onClose={() => setStatusTarget(null)} onUpdated={load} />
      )}

      {/* Header */}
      <div className="mb-6">
        <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-lg">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
              <p className="text-gray-500 text-sm">{patient.condition}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {patient.testResult && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_BADGE[patient.testResult] ?? 'bg-gray-100 text-gray-600'}`}>
                    {patient.testResult}
                  </span>
                )}
                {patient.testDate && (
                  <span className="text-xs text-gray-400">Tested {patient.testDate}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={deletePatient}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete patient
          </button>
        </div>
      </div>

      {/* Patient info + cascade rate */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Patient Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Email', value: patient.email },
              { label: 'Phone', value: patient.phone },
              { label: 'Date of birth', value: patient.dateOfBirth },
              { label: 'At-risk relatives', value: patient.familyMembers.length.toString() },
            ].map((f) => f.value ? (
              <div key={f.label}>
                <div className="text-xs text-gray-500 mb-0.5">{f.label}</div>
                <div className="text-gray-900">{f.value}</div>
              </div>
            ) : null)}
          </div>
          {patient.notes && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="text-xs text-gray-500 mb-1">Clinical notes</div>
              <p className="text-sm text-gray-700">{patient.notes}</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
          <div className={`text-4xl font-bold mb-1 ${cascadeRate >= 30 ? 'text-green-600' : 'text-red-500'}`}>
            {cascadeRate}%
          </div>
          <div className="text-sm text-gray-500">Cascade rate</div>
          <div className="text-xs text-gray-400 mt-1">Industry: 30%</div>
          <div className={`mt-3 text-xs font-medium px-2 py-1 rounded-full ${cascadeRate >= 30 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {cascadeRate >= 30 ? 'Above baseline' : 'Below baseline'}
          </div>
        </div>
      </div>

      {/* Family members */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">At-Risk Relatives</h3>
            <p className="text-xs text-gray-500 mt-0.5">{patient.familyMembers.length} family members tracked</p>
          </div>
          <button
            onClick={() => setAddingMember(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add relative
          </button>
        </div>

        {patient.familyMembers.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-4">No at-risk relatives added yet.</p>
            <button
              onClick={() => setAddingMember(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add first relative
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {patient.familyMembers.map((member) => {
              const statusCfg = STATUS_CONFIG[member.testStatus] ?? STATUS_CONFIG['not-contacted'];
              const StatusIcon = statusCfg.icon;
              return (
                <div key={member.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">
                          {member.firstName} {member.lastName}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{member.relationship}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        {member.testResult && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_BADGE[member.testResult] ?? 'bg-gray-100 text-gray-600'}`}>
                            {member.testResult}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        {member.email && <span>{member.email}</span>}
                        {member.phone && <span>{member.phone}</span>}
                        {member.outreaches.length > 0 && (
                          <span>{member.outreaches.length} outreach{member.outreaches.length !== 1 ? 'es' : ''} sent</span>
                        )}
                      </div>

                      {/* Outreach history */}
                      {member.outreaches.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {member.outreaches.slice(0, 3).map((o) => (
                            <div key={o.id} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                              <span className="capitalize font-medium text-gray-700">{o.method}</span>
                              <span>·</span>
                              <span className={`font-medium ${o.status === 'responded' ? 'text-green-600' : o.status === 'sent' ? 'text-blue-600' : 'text-gray-500'}`}>
                                {o.status}
                              </span>
                              <span>·</span>
                              <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setStatusTarget(member)}
                        title="Update status"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setOutreachTarget(member)}
                        title="Send outreach"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        title="Remove"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
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
