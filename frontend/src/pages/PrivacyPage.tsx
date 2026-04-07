import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy & Data Disclosure</h1>
              <p className="text-sm text-gray-500">Last updated: April 6, 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
          
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Lineage AI is committed to protecting the privacy and security of your personal and health information. 
              This Privacy Policy describes how we collect, use, disclose, and safeguard information when you use our 
              genetic cascade testing coordination platform, including when connecting to Electronic Health Record (EHR) 
              systems through SMART on FHIR.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            
            <h3 className="font-medium text-gray-800 mt-4 mb-2">From Healthcare Providers:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Account information (name, email, organization, role)</li>
              <li>Authentication credentials</li>
              <li>Usage data and audit logs</li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">From EHR Systems (with authorization):</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Patient demographics (name, date of birth, contact information)</li>
              <li>Genetic test results and dates</li>
              <li>Relevant clinical observations</li>
              <li>Family history information</li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">From Family Portal Users:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Portal access logs</li>
              <li>Chat interactions with the AI assistant (anonymized)</li>
              <li>Opt-out requests and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide and maintain the cascade testing coordination service</li>
              <li>Facilitate communication between healthcare providers and at-risk family members</li>
              <li>Generate analytics and reports on cascade testing rates</li>
              <li>Write authorized observations back to connected EHR systems</li>
              <li>Improve the Service through aggregated, de-identified usage analysis</li>
              <li>Comply with legal obligations and respond to lawful requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. EHR Data Access Disclosure</h2>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-4">
              <h3 className="font-medium text-indigo-900 mb-2">When you connect Lineage AI to your EHR:</h3>
              <ul className="text-indigo-800 space-y-2 text-sm">
                <li><strong>Read Access:</strong> We read patient demographics, genetic test results, and relevant observations</li>
                <li><strong>Write Access:</strong> With your explicit action, we write genetic testing observations and results back to the EHR</li>
                <li><strong>Scope Limited:</strong> We request only the minimum necessary FHIR scopes for cascade testing coordination</li>
              </ul>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You can revoke EHR access at any time through your EHR's application management settings or by 
              disconnecting the integration within Lineage AI.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Storage and Security</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Your data is protected using industry-leading security measures:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Encryption</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>AES-256-GCM for data at rest</li>
                  <li>TLS 1.3 for data in transit</li>
                  <li>Field-level encryption for PII</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Infrastructure</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>SOC 2 Type II compliant hosting</li>
                  <li>Automated security monitoring</li>
                  <li>Regular penetration testing</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Access Controls</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Role-based permissions</li>
                  <li>Multi-factor authentication</li>
                  <li>Session timeout policies</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Audit & Compliance</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Comprehensive audit logging</li>
                  <li>HIPAA compliance</li>
                  <li>Regular compliance reviews</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We do not sell your personal or health information. We may share information only in these circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>With your healthcare organization:</strong> Data is accessible to authorized users within your clinic</li>
              <li><strong>Service providers:</strong> We use trusted vendors (hosting, email delivery) under strict data protection agreements</li>
              <li><strong>Legal requirements:</strong> When required by law, subpoena, or to protect safety</li>
              <li><strong>Business transfers:</strong> In connection with a merger or acquisition, with continued privacy protections</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We retain data according to the following schedule:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Active patient data:</strong> Retained while your account is active</li>
              <li><strong>Audit logs:</strong> Retained for 7 years per HIPAA requirements</li>
              <li><strong>Family portal access logs:</strong> Retained for 3 years</li>
              <li><strong>Deleted data:</strong> Permanently removed within 90 days of deletion request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Family members can opt out of cascade testing outreach at any time</li>
              <li><strong>Revoke access:</strong> Disconnect EHR integrations at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise these rights, contact us at privacy@lineageai.net.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Family Portal Privacy</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              The Family Portal is designed with privacy in mind:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>No login or account creation required</li>
              <li>Portal links expire after 30 days</li>
              <li>Limited information displayed (condition name, general statistics)</li>
              <li>No individual family member names or contact details shown</li>
              <li>AI chatbot conversations are not stored with identifying information</li>
              <li>One-click opt-out available</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of material changes via email 
              or through the Service at least 30 days before they take effect. Your continued use of the Service 
              after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about this Privacy Policy or our data practices:
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p><strong>Lineage AI Privacy Team</strong></p>
              <p>Email: privacy@lineageai.net</p>
              <p>HIPAA Compliance: compliance@lineageai.net</p>
              <p>Data Protection Officer: dpo@lineageai.net</p>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">HIPAA Notice</h2>
            <p className="text-gray-600 leading-relaxed">
              Lineage AI operates as a Business Associate under HIPAA when processing Protected Health Information 
              on behalf of Covered Entities. We maintain a comprehensive HIPAA compliance program and execute 
              Business Associate Agreements with all healthcare organization customers. For a copy of our BAA 
              template or to report a potential HIPAA concern, contact compliance@lineageai.net.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
