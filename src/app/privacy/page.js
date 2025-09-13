"use client";
import { useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | FinTech Calgary";
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-300">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Information We Collect
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as
                  when you:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Create an account or apply for membership</li>
                  <li>Register for events</li>
                  <li>Contact us or subscribe to our newsletter</li>
                  <li>Participate in surveys or provide feedback</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  This information may include your name, email address, phone
                  number, organization details, and other information you choose
                  to provide.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>
                    Process membership applications and manage member accounts
                  </li>
                  <li>
                    Send you technical notices, updates, and support messages
                  </li>
                  <li>Respond to your comments and questions</li>
                  <li>Send you newsletters and promotional communications</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>
                    Detect, investigate, and prevent fraudulent transactions
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. Information Sharing
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent, except in
                  the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>
                    With service providers who assist us in operating our
                    website
                  </li>
                  <li>
                    In connection with a merger, acquisition, or sale of assets
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Data Security
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. However, no method of transmission
                  over the internet or electronic storage is 100% secure, so we
                  cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Cookies and Tracking
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our website</li>
                  <li>Improve our services and user experience</li>
                  <li>Provide personalized content and advertisements</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  You can control cookies through your browser settings, but
                  disabling cookies may affect the functionality of our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Third-Party Services
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our website may contain links to third-party websites or
                  services. We are not responsible for the privacy practices of
                  these third parties. We encourage you to read their privacy
                  policies before providing any personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes outlined in this privacy policy,
                  unless a longer retention period is required or permitted by
                  law. When we no longer need your information, we will securely
                  delete or anonymize it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Your Rights
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights
                  regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to restrict or object to processing</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  To exercise these rights, please contact us using the
                  information provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Children&apos;s Privacy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our services are not directed to children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If we become aware that we have collected
                  personal information from a child under 13, we will take steps
                  to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Changes to This Policy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this privacy policy from time to time. We will
                  notify you of any changes by posting the new privacy policy on
                  this page and updating the &quot;Last updated&quot; date. We
                  encourage you to review this privacy policy periodically for
                  any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  11. Contact Us
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this privacy policy or our
                  privacy practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-300">
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:fintech.calgary@gmail.com"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      fintech.calgary@gmail.com
                    </a>
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>Address:</strong> University of Calgary, 2500
                    University Dr NW, Calgary, AB T2N 1N4
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
