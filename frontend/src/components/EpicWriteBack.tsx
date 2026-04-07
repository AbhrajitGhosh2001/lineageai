import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface EpicWriteBackProps {
  patientId: string;
  condition: string;
  testResult: string | null;
  testDate: string | null;
}

export default function EpicWriteBack({ patientId, condition, testResult, testDate }: EpicWriteBackProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fhirPatientId, setFhirPatientId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const epicAccessToken = localStorage.getItem('epic_access_token');
  const savedFhirPatientId = localStorage.getItem('epic_patient_id');

  const handleWriteBack = async () => {
    const patientFhirId = fhirPatientId || savedFhirPatientId;
    
    if (!patientFhirId) {
      setErrorMessage('Please enter the FHIR Patient ID');
      setStatus('error');
      return;
    }

    if (!epicAccessToken) {
      setErrorMessage('Not connected to Epic. Please connect from the Dashboard first.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await api.post('/auth/epic/write-observation', {
        accessToken: epicAccessToken,
        patientFhirId,
        observation: {
          loincCode: '55233-1',
          display: `Genetic analysis - ${condition}`,
          result: testResult || 'Pending',
          effectiveDate: testDate || new Date().toISOString(),
          interpretation: testResult === 'positive' ? 'POS' : testResult === 'negative' ? 'NEG' : undefined,
        },
      });

      setStatus('success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to write to EHR');
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <Upload className="w-4 h-4" />
        Write to Epic EHR
      </button>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mt-4">
      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Write to Epic EHR
      </h4>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Successfully written to Epic EHR</span>
        </div>
      ) : status === 'error' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">{errorMessage}</span>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">
              FHIR Patient ID
            </label>
            <input
              type="text"
              value={fhirPatientId || savedFhirPatientId || ''}
              onChange={(e) => setFhirPatientId(e.target.value)}
              placeholder="e.g., erXuFYUfucBZaryVksYEcMg3"
              className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              The patient's ID in the Epic FHIR system
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            <div className="font-medium mb-1">Data to write:</div>
            <ul className="space-y-1">
              <li>Condition: {condition}</li>
              <li>Result: {testResult || 'Pending'}</li>
              <li>Date: {testDate || 'Today'}</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWriteBack}
              disabled={status === 'loading'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Writing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Write to EHR
                </>
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
