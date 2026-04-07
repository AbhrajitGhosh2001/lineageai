import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-500">Last updated: April 6, 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
          
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Service Description</h2>
            <p className="text-gray-600 leading-relaxed">
              Lineage AI ("Service") is a genetic-risk cascade screening coordination platform designed for healthcare 
              providers, genetic counselors, and clinical teams. The Service facilitates the coordination of cascade 
              genetic testing by helping track at-risk family members, manage outreach communications, and monitor 
              testing completion rates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Eligibility and Authorization</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              The Service is intended for use by:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Licensed genetic counselors and healthcare providers</li>
              <li>Clinical staff authorized by their healthcare organization</li>
              <li>Healthcare administrators overseeing genetic testing programs</li>
              <li>Patients and family members accessing the Family Portal with a valid invitation link</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              By using this Service, you represent that you have the authority to access and use patient health 
              information in accordance with applicable laws and your organization's policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. HIPAA Compliance</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Lineage AI is designed to comply with the Health Insurance Portability and Accountability Act (HIPAA) 
              and its implementing regulations. We implement appropriate administrative, physical, and technical 
              safeguards to protect the confidentiality, integrity, and availability of Protected Health Information (PHI).
            </p>
            <p className="text-gray-600 leading-relaxed">
              Healthcare organizations using Lineage AI must execute a Business Associate Agreement (BAA) with us 
              prior to processing PHI through the Service. Contact us at compliance@lineageai.net to initiate a BAA.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. EHR Integration and Data Access</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              When you connect Lineage AI to your Electronic Health Record (EHR) system through SMART on FHIR:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>We access only the minimum necessary patient data required to provide the Service</li>
              <li>Data accessed includes patient demographics, genetic test results, and relevant clinical observations</li>
              <li>We may write genetic testing observations and results back to the EHR with your explicit authorization</li>
              <li>All data transmission is encrypted using TLS 1.3</li>
              <li>Access tokens are stored securely and expire according to your EHR's security policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              As a user of the Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Access only patient information for which you have a legitimate clinical or administrative need</li>
              <li>Comply with all applicable federal, state, and local laws regarding patient privacy</li>
              <li>Report any suspected security incidents or unauthorized access immediately</li>
              <li>Ensure that family portal links are shared only with intended recipients</li>
              <li>Verify patient identity before initiating outreach communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Multi-factor authentication support</li>
              <li>Role-based access controls</li>
              <li>Comprehensive audit logging of all data access</li>
              <li>Regular security assessments and penetration testing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. LINEAGE AI SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Clinical decisions made based on information provided through the Service</li>
              <li>Delays or failures in cascade testing coordination</li>
              <li>Inaccuracies in data imported from external EHR systems</li>
              <li>Actions taken by family members who receive outreach communications</li>
              <li>Indirect, incidental, special, or consequential damages</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              The Service is a coordination tool and does not replace professional medical judgment. All clinical 
              decisions remain the responsibility of the treating healthcare provider.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, we will securely delete or 
              return your data in accordance with applicable regulations and our data retention policy. Certain 
              audit logs may be retained as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms of Service from time to time. We will notify you of material changes via 
              email or through the Service. Continued use of the Service after changes take effect constitutes 
              acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p><strong>Lineage AI</strong></p>
              <p>Email: legal@lineageai.net</p>
              <p>Compliance: compliance@lineageai.net</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
