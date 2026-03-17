import { Link } from 'react-router-dom';
import { Activity, Users, Bell, BarChart3, Shield, ArrowRight, CheckCircle, TrendingUp, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useDarkMode } from '../hooks/useDarkMode';
import cmsConfig from '../lib/cms-config.json';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function LandingPage() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <SEO
        title={cmsConfig.pages['/'].title}
        description={cmsConfig.pages['/'].description}
        keywords={cmsConfig.pages['/'].keywords}
        canonical="/"
      />

      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-slate-100">Lineage AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/login" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 text-sm font-medium">Sign in</Link>
          <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Genetic testing market growing 12.4% CAGR to $58.71B by 2033
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            className="text-5xl font-bold text-gray-900 dark:text-slate-100 mb-6 leading-tight max-w-4xl mx-auto">
            Cascade testing completion rates are stuck at{' '}
            <span className="text-indigo-600">30%.</span>
            <br />
            The coordination is the bottleneck.
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            className="text-xl text-gray-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Lineage AI automates family outreach, maps hereditary risk across generations, and tracks
            cascade testing from one HIPAA-compliant dashboard.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
              Start free pilot <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
              Sign in to dashboard
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} custom={4} className="text-sm text-gray-500 dark:text-slate-500 mt-4">
            $99/clinic for first 3 months · No credit card required
          </motion.p>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 dark:bg-slate-800 border-y border-gray-100 dark:border-slate-700 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '30%', label: 'Industry cascade rate' },
            { value: '5,500+', label: 'US genetic counselors' },
            { value: '$58.71B', label: 'Market by 2033' },
            { value: '7/10', label: 'At-risk relatives never tested' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="text-3xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 text-center mb-4">
          Everything a genetic counselor needs
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-center mb-14 max-w-xl mx-auto">
          Built specifically for cascade testing coordination — not adapted from generic CRM tools.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'Visual Family Tree', desc: 'Map hereditary risk across generations. See at-risk relatives and testing status at a glance.', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
            { icon: Bell, title: 'Automated Outreach', desc: 'Send personalized messages via email, SMS, or letter. Timed follow-ups ensure no relative falls through.', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
            { icon: BarChart3, title: 'Cascade Dashboard', desc: 'Track completion rates against the 30% industry baseline. See exactly where each family stands.', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
            { icon: Shield, title: 'HIPAA Compliant', desc: 'Field-level encryption, audit logs, consent tracking, and compliance reporting built in from day one.', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
            { icon: Activity, title: 'Multi-Condition Support', desc: 'BRCA1/2, Lynch Syndrome, FH, HCM, and more. Expand into any hereditary condition with the same workflow.', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
            { icon: TrendingUp, title: 'Outcome Analytics', desc: 'Prove the coordination was the bottleneck. Report cascade completion rates to practices and payers.', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
          ].map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} viewport={{ once: true }}
              className="p-6 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Conditions section */}
      <section className="bg-gray-50 dark:bg-slate-800 border-y border-gray-100 dark:border-slate-700 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2 text-center">Conditions we support</h2>
          <p className="text-gray-500 dark:text-slate-400 text-center mb-10 text-sm">Specialized cascade testing workflows for every hereditary condition</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cmsConfig.conditions.map((c) => (
              <Link key={c.slug} to={`/conditions/${c.slug}`}
                className="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl p-3 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all">
                <div className={`text-xs px-1.5 py-0.5 rounded font-medium inline-block mb-1.5 ${
                  c.cascadeUrgency === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>{c.cascadeUrgency}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{c.shortName}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{c.prevalence}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 dark:text-slate-400 text-center mb-14">Start free, scale as you grow.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Pilot', price: '$99', period: '/clinic · 3 months', desc: 'Perfect for validating the platform with your first cases.', features: ['Up to 20 patients', 'Family tree mapping', 'Basic outreach tracking', 'Email support'], cta: 'Start pilot', highlight: false },
              { name: 'Core', price: '$100–$500', period: '/user/month', desc: 'Full platform access for active genetic counseling practices.', features: ['Unlimited patients', 'Automated multi-channel outreach', 'Cascade analytics', 'Priority support', 'HIPAA compliance logging'], cta: 'Get started', highlight: true },
              { name: 'Enterprise', price: '$25K–$100K', period: '/year', desc: 'For health systems with in-house genetics departments.', features: ['EHR integration', 'Custom workflows', 'Payer reporting', 'Dedicated CSM', 'SLA guarantee'], cta: 'Contact sales', highlight: false },
            ].map((plan) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`rounded-2xl p-6 border ${
                  plan.highlight
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100'
                }`}>
                <div className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>{plan.name}</div>
                <div className="text-2xl font-bold mb-1">{plan.price}</div>
                <div className={`text-xs mb-4 ${plan.highlight ? 'text-indigo-200' : 'text-gray-500 dark:text-slate-400'}`}>{plan.period}</div>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-indigo-100' : 'text-gray-500 dark:text-slate-400'}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">The coordination is the bottleneck. Fix it.</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          Join genetic counseling practices already using Lineage AI to push cascade completion rates above the 30% industry baseline.
        </p>
        <Link to="/register"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
          Start your free pilot <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4 text-sm text-gray-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium text-gray-600 dark:text-slate-300">Lineage AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/conditions/brca1-brca2-hereditary-breast-ovarian-cancer" className="hover:text-gray-600 dark:hover:text-slate-300">BRCA1/2</Link>
            <Link to="/conditions/lynch-syndrome-hereditary-colorectal-cancer" className="hover:text-gray-600 dark:hover:text-slate-300">Lynch Syndrome</Link>
            <Link to="/conditions/familial-hypercholesterolemia" className="hover:text-gray-600 dark:hover:text-slate-300">FH</Link>
          </div>
          <div>© 2026 Lineage AI · HIPAA compliant</div>
        </div>
      </footer>
    </div>
  );
}
