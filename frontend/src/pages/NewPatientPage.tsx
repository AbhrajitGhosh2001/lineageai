import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';

const CONDITIONS = [
  'BRCA1/2 - Hereditary Breast/Ovarian Cancer',
  'Lynch Syndrome - Hereditary Colorectal Cancer',
  'Familial Hypercholesterolemia',
  'Hereditary Diffuse Gastric Cancer',
  'Li-Fraumeni Syndrome',
  'Cowden Syndrome',
  'MEN1 - Multiple Endocrine Neoplasia',
  'MEN2 - Multiple Endocrine Neoplasia',
  'Von Hippel-Lindau Disease',
  'Neurofibromatosis Type 1',
  'Marfan Syndrome',
  'Hypertrophic Cardiomyopathy',
  'Long QT Syndrome',
  'Other',
];

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '', condition: '', testResult: '', testDate: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/patients', form);
      navigate(`/patients/${res.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to create patient.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Add new patient</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Enter the proband's information to start cascade testing coordination.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-6 border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>First name *</label><input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Last name *</label><input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required className={inputCls} /></div>
          </div>

          <div>
            <label className={labelCls}>Condition / Hereditary risk *</label>
            <select value={form.condition} onChange={(e) => update('condition', e.target.value)} required className={inputCls}>
              <option value="">Select condition…</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Test result</label>
              <select value={form.testResult} onChange={(e) => update('testResult', e.target.value)} className={inputCls}>
                <option value="">Unknown</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="variant">Variant of uncertain significance</option>
              </select>
            </div>
            <div><label className={labelCls}>Test date</label><input type="date" value={form.testDate} onChange={(e) => update('testDate', e.target.value)} className={inputCls} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Phone</label><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputCls} /></div>
          </div>

          <div><label className={labelCls}>Date of birth</label><input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} className={inputCls} /></div>

          <div>
            <label className={labelCls}>Clinical notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Additional notes about the patient or case…" className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? 'Saving…' : 'Add patient'}
            </button>
            <Link to="/patients" className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
