import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface EpicConfig {
  enabled: boolean;
  launchUrl: string | null;
  redirectUri: string;
}

export default function EpicIntegration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<EpicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/auth/epic/config')
      .then((r) => setConfig(r.data))
      .catch(() => setConfig({ enabled: false, launchUrl: null, redirectUri: '' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const epicConnected = searchParams.get('epic_connected');
    const epicError = searchParams.get('epic_error');
    const epicPatient = searchParams.get('epic_patient');

    if (epicConnected === 'true') {
      setConnectionStatus('success');
      if (epicPatient) {
        localStorage.setItem('epic_patient_id', epicPatient);
      }
      searchParams.delete('epic_connected');
      searchParams.delete('epic_patient');
      setSearchParams(searchParams, { replace: true });
    } else if (epicError) {
      setConnectionStatus('error');
      setErrorMessage(decodeURIComponent(epicError));
      searchParams.delete('epic_error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleConnect = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://lineageai-copy-production.up.railway.app'}/api/auth/epic/standalone-launch`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Checking EHR integration...</span>
        </div>
      </div>
    );
  }

  if (!config?.enabled) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">EHR Integration</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Epic FHIR integration is not configured. Contact your administrator to enable EHR write-back.
            </p>
            <a
              href="https://fhir.epic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 mt-3 hover:underline"
            >
              Learn about Epic App Orchard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          connectionStatus === 'success' 
            ? 'bg-green-100 dark:bg-green-900/40' 
            : connectionStatus === 'error'
            ? 'bg-red-100 dark:bg-red-900/40'
            : 'bg-indigo-100 dark:bg-indigo-900/40'
        }`}>
          {connectionStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : connectionStatus === 'error' ? (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          ) : (
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Epic EHR Integration</h3>
          
          {connectionStatus === 'success' ? (
            <div className="mt-2">
              <p className="text-sm text-green-600 dark:text-green-400">
                Successfully connected to Epic EHR. You can now sync patient data and write observations back.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleConnect}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Reconnect
                </button>
              </div>
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="mt-2">
              <p className="text-sm text-red-600 dark:text-red-400">
                Connection failed: {errorMessage || 'Unknown error'}
              </p>
              <button
                onClick={handleConnect}
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Connect to Epic to sync patient data and write genetic test results back to the EHR.
              </p>
              <button
                onClick={handleConnect}
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Connect to Epic
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
