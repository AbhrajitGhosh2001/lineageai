import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import cmsConfig from '../lib/cms-config.json';

const URGENCY_CONFIG = {
  critical: { label: 'Critical urgency', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  high: { label: 'High urgency', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  moderate: { label: 'Moderate urgency', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export default function ConditionPage() {
  const { slug } = useParams<{ slug: string }>();
  const condition = cmsConfig.conditions.find((c) => c.slug === slug);

  if (!condition) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Condition not found</h1>
          <Link to="/" className="text-indigo-600 hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const urgency = URGENCY_CONFIG[condition.cascadeUrgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.high;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <SEO
        title={`${condition.name} Cascade Testing | Lineage AI`}
        description={condition.seoDescription}
        keywords={condition.keywords}
        canonical={`/conditions/${condition.slug}`}
      />

      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-slate-800 px-6 py-4 max-w-5xl mx-auto flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="text-gray-300 dark:text-slate-600">/</span>
        <span className="text-sm text-gray-500 dark:text-slate-400">Conditions</span>
        <span className="text-gray-300 dark:text-slate-600">/</span>
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{condition.shortName}</span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${urgency.color}`}>
              {urgency.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">{condition.prevalence}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4 leading-tight">
            {condition.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-10 leading-relaxed">
            {condition.description}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">How Lineage AI helps</h3>
              <p className="text-indigo-800 dark:text-indigo-200 text-sm leading-relaxed">
                {condition.seoDescription}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Cascade testing checklist</h3>
              <ul className="space-y-2">
                {[
                  'Identify all first-degree relatives',
                  'Send personalized outreach (email/SMS/letter)',
                  'Track consent and scheduling',
                  'Log test results and follow-ups',
                  'Report cascade completion rate',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 dark:bg-slate-800 rounded-2xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">
              Cascade rates for {condition.shortName} are stuck below 30%
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
              The coordination is the bottleneck — not patient willingness. Lineage AI fixes that.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start free pilot <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Other conditions */}
      <section className="border-t border-gray-100 dark:border-slate-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-6">Other conditions we support</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cmsConfig.conditions
              .filter((c) => c.slug !== slug)
              .slice(0, 6)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/conditions/${c.slug}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-1"
                >
                  {c.shortName}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
