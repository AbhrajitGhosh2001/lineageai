import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import api from '../lib/api';

interface CapacityStats {
  scheduledThisMonth: number;
  pendingOutreach: number;
  inProgress: number;
  completedTotal: number;
  remainingCapacity: number;
  slotsNeeded: number;
  workingDaysLeft: number;
  recommendation: string;
}

export default function CapacityPage() {
  const [stats, setStats] = useState<CapacityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clinic/capacity')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!stats) return null;

  const utilizationPct = stats.remainingCapacity > 0
    ? Math.min(100, Math.round((stats.inProgress / stats.remainingCapacity) * 100))
    : 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Clinic Capacity Manager</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} · {stats.workingDaysLeft} working days remaining
        </p>
      </div>

      {/* Recommendation banner */}
      <div className={`rounded-2xl p-5 mb-6 flex items-start gap-4 ${
        stats.slotsNeeded > 0
          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          stats.slotsNeeded > 0 ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-green-100 dark:bg-green-900/40'
        }`}>
          {stats.slotsNeeded > 0
            ? <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            : <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
        </div>
        <div>
          <div className={`font-semibold text-sm ${stats.slotsNeeded > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
            {stats.slotsNeeded > 0 ? 'Action Needed' : 'Capacity Sufficient'}
          </div>
          <div className={`text-sm mt-0.5 ${stats.slotsNeeded > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
            {stats.recommendation}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Scheduled this month', value: stats.scheduledThisMonth, icon: Calendar, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40' },
          { label: 'Pending outreach', value: stats.pendingOutreach, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40' },
          { label: 'In progress', value: stats.inProgress, icon: Clock, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40' },
          { label: 'Completed total', value: stats.completedTotal, icon: CheckCircle, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{kpi.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Capacity utilization */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Capacity Utilization</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">In-progress cases vs. remaining counseling slots</p>
          <div className="relative">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
              <span>{stats.inProgress} in progress</span>
              <span>{stats.remainingCapacity} slots remaining</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${utilizationPct >= 90 ? 'bg-red-500' : utilizationPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${utilizationPct}%` }}
              />
            </div>
            <div className="text-center mt-3">
              <span className={`text-3xl font-bold ${utilizationPct >= 90 ? 'text-red-600 dark:text-red-400' : utilizationPct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                {utilizationPct}%
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">utilized</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Pipeline Breakdown
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">Current state of all at-risk relatives</p>
          <div className="space-y-3">
            {[
              { label: 'Not yet contacted', value: stats.pendingOutreach, color: 'bg-gray-200 dark:bg-slate-600', textColor: 'text-gray-600 dark:text-slate-300' },
              { label: 'In progress (contacted/scheduled)', value: stats.inProgress, color: 'bg-indigo-400', textColor: 'text-indigo-700 dark:text-indigo-300' },
              { label: 'Testing completed', value: stats.completedTotal, color: 'bg-green-400', textColor: 'text-green-700 dark:text-green-300' },
            ].map((row) => {
              const total = stats.pendingOutreach + stats.inProgress + stats.completedTotal;
              const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={row.textColor}>{row.label}</span>
                    <span className="text-gray-500 dark:text-slate-400">{row.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staffing guidance */}
      {stats.slotsNeeded > 0 && (
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" /> Staffing Recommendation
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.slotsNeeded}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Additional slots needed</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{Math.ceil(stats.slotsNeeded / 12)}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Extra counseling days</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.workingDaysLeft}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Days left this month</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
