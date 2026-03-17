import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import type { Patient } from '../types';

const RESULT_BADGE: Record<string, string> = {
  positive: 'bg-red-50 text-red-700',
  negative: 'bg-green-50 text-green-700',
  variant: 'bg-amber-50 text-amber-700',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/patients').then((r) => setPatients(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q)
    );
  });

  function cascadeRate(p: Patient) {
    if (!p.familyMembers.length) return null;
    const done = p.familyMembers.filter((m) => m.testStatus === 'completed').length;
    return Math.round((done / p.familyMembers.length) * 100);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">Manage proband records and family cascade testing</p>
        </div>
        <Link
          to="/patients/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add patient
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or condition…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">
            {search ? 'No patients match your search' : 'No patients yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {search ? 'Try a different search term.' : 'Add your first proband to start cascade testing coordination.'}
          </p>
          {!search && (
            <Link
              to="/patients/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add first patient
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const rate = cascadeRate(p);
            const atRisk = p.familyMembers.length;
            const notContacted = p.familyMembers.filter((m) => m.testStatus === 'not-contacted').length;
            return (
              <Link
                key={p.id}
                to={`/patients/${p.id}`}
                className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {p.firstName} {p.lastName}
                    </span>
                    {p.testResult && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_BADGE[p.testResult] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.testResult}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">{p.condition}</div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs text-gray-400">{atRisk} at-risk relatives</span>
                    {notContacted > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        {notContacted} not contacted
                      </span>
                    )}
                    {rate !== null && (
                      <span className={`text-xs font-medium ${rate >= 30 ? 'text-green-600' : 'text-red-500'}`}>
                        {rate}% cascade rate
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
