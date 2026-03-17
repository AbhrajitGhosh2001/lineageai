import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Activity, CheckCircle, Clock, TrendingUp, AlertCircle, ArrowRight, Mail
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import api from '../lib/api';
import type { DashboardStats } from '../types';

const STATUS_COLORS: Record<string, string> = {
  'not-contacted': '#e5e7eb',
  contacted: '#fbbf24',
  scheduled: '#60a5fa',
  completed: '#34d399',
  declined: '#f87171',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/dashboard')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { name: 'Not contacted', value: stats.notContacted, color: STATUS_COLORS['not-contacted'] },
    { name: 'Contacted', value: stats.contacted, color: STATUS_COLORS.contacted },
    { name: 'Scheduled', value: stats.scheduled, color: STATUS_COLORS.scheduled },
    { name: 'Completed', value: stats.tested, color: STATUS_COLORS.completed },
    { name: 'Declined', value: stats.declined, color: STATUS_COLORS.declined },
  ];

  const gaugeData = [
    { name: 'Industry', value: stats.industryBaseline, fill: '#e5e7eb' },
    { name: 'Your rate', value: stats.cascadeRate, fill: stats.cascadeRate >= stats.industryBaseline ? '#34d399' : '#f87171' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Cascade testing overview across all your patients</p>
        </div>
        <Link
          to="/patients/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          Add patient
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total patients', value: stats.totalPatients, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'At-risk relatives', value: stats.totalAtRisk, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Testing completed', value: stats.tested, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Cascade rate', value: `${stats.cascadeRate}%`, icon: TrendingUp, color: stats.cascadeRate >= stats.industryBaseline ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Cascade rate gauge */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="font-semibold text-gray-900 mb-1 self-start">Cascade Rate</h3>
          <p className="text-xs text-gray-500 mb-4 self-start">vs. 30% industry baseline</p>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart
              cx="50%" cy="80%"
              innerRadius="60%" outerRadius="100%"
              startAngle={180} endAngle={0}
              data={gaugeData}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#f3f4f6' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <div className="text-3xl font-bold text-gray-900">{stats.cascadeRate}%</div>
            <div className="text-xs text-gray-500">
              Industry: {stats.industryBaseline}%
              {stats.cascadeRate >= stats.industryBaseline
                ? <span className="text-green-600 ml-1">↑ Above baseline</span>
                : <span className="text-red-500 ml-1">↓ Below baseline</span>}
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Relative Status</h3>
          <p className="text-xs text-gray-500 mb-4">Testing pipeline breakdown</p>
          {stats.totalAtRisk === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              No family members added yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Count']} />
                <Bar dataKey="value" radius={4}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Conditions</h3>
          <p className="text-xs text-gray-500 mb-4">Patient distribution by condition</p>
          {stats.conditionBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
              <Activity className="w-8 h-8 mb-2 opacity-40" />
              No patients yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.conditionBreakdown}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent outreaches */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Outreach Activity</h3>
          <Link to="/patients" className="text-indigo-600 text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stats.recentOutreaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
            <Mail className="w-8 h-8 mb-2 opacity-40" />
            No outreach sent yet. Add a patient and start coordinating.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentOutreaches.map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {o.familyMember.firstName} {o.familyMember.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {o.method} · re: {o.familyMember.patient.firstName} {o.familyMember.patient.lastName}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      o.status === 'responded'
                        ? 'bg-green-50 text-green-700'
                        : o.status === 'sent'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {o.status}
                  </span>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
