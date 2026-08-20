"use client";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function TermsPage() {

  return (
    <PublicPageShell title="Terms of Service | FinTech Calgary">

      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto px-6 pb-16 pt-36 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <PageTitle sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6">
                Terms of Service
              </PageTitle>
              <p className="fc-lede">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <GlowCard
              customSize
              glowColor="purple"
              className="w-full space-y-8 !gap-0 !p-8"
            >
              <div className="relative z-10 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="fc-body-lg">
                  By accessing and using the FinTech Calgary website and
                  services, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by
                  the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. Use License
                </h2>
                <p className="fc-body-lg mb-4">
                  Permission is granted to temporarily download one copy of the
                  materials on FinTech Calgary&apos;s website for personal,
                  non-commercial transitory viewing only. This is the grant of a
                  license, not a transfer of title, and under this license you
                  may not:
                </p>
                <ul className="list-disc list-inside fc-body-lg space-y-2 ml-4">
                  <li>modify or copy the materials</li>
                  <li>
                    use the materials for any commercial purpose or for any
                    public display
                  </li>
                  <li>
                    attempt to reverse engineer any software contained on the
                    website
                  </li>
                  <li>
                    remove any copyright or other proprietary notations from the
                    materials
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. Member Responsibilities
                </h2>
                <p className="fc-body-lg mb-4">
                  As a member of FinTech Calgary, you agree to:
                </p>
                <ul className="list-disc list-inside fc-body-lg space-y-2 ml-4">
                  <li>
                    Provide accurate and truthful information in your membership
                    application
                  </li>
                  <li>
                    Maintain the confidentiality of your account credentials
                  </li>
                  <li>
                    Use the services in accordance with applicable laws and
                    regulations
                  </li>
                  <li>
                    Respect other members and maintain professional conduct
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Privacy Policy
                </h2>
                <p className="fc-body-lg">
                  Your privacy is important to us. Please review our Privacy
                  Policy, which also governs your use of the website, to
                  understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Prohibited Uses
                </h2>
                <p className="fc-body-lg mb-4">
                  You may not use our website:
                </p>
                <ul className="list-disc list-inside fc-body-lg space-y-2 ml-4">
                  <li>
                    For any unlawful purpose or to solicit others to perform
                    unlawful acts
                  </li>
                  <li>
                    To violate any international, federal, provincial, or state
                    regulations, rules, laws, or local ordinances
                  </li>
                  <li>
                    To infringe upon or violate our intellectual property rights
                    or the intellectual property rights of others
                  </li>
                  <li>
                    To harass, abuse, insult, harm, defame, slander, disparage,
                    intimidate, or discriminate
                  </li>
                  <li>To submit false or misleading information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Content and Intellectual Property
                </h2>
                <p className="fc-body-lg">
                  The content on this website, including but not limited to
                  text, graphics, logos, images, and software, is the property
                  of FinTech Calgary and is protected by copyright and other
                  intellectual property laws. You may not reproduce, distribute,
                  or create derivative works without our express written
                  permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Disclaimer
                </h2>
                <p className="fc-body-lg">
                  The materials on FinTech Calgary&apos;s website are provided
                  on an &apos;as is&apos; basis. FinTech Calgary makes no
                  warranties, expressed or implied, and hereby disclaims and
                  negates all other warranties including without limitation,
                  implied warranties or conditions of merchantability, fitness
                  for a particular purpose, or non-infringement of intellectual
                  property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Limitations
                </h2>
                <p className="fc-body-lg">
                  In no event shall FinTech Calgary or its suppliers be liable
                  for any damages (including, without limitation, damages for
                  loss of data or profit, or due to business interruption)
                  arising out of the use or inability to use the materials on
                  FinTech Calgary&apos;s website, even if FinTech Calgary or a
                  FinTech Calgary authorized representative has been notified
                  orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Revisions
                </h2>
                <p className="fc-body-lg">
                  FinTech Calgary may revise these terms of service for its
                  website at any time without notice. By using this website, you
                  are agreeing to be bound by the then current version of these
                  terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Contact Information
                </h2>
                <p className="fc-body-lg">
                  If you have any questions about these Terms of Service, please
                  contact us at{" "}
                  <a
                    href="mailto:fintech.calgary@gmail.com"
                    className="fc-link underline decoration-primary/30 underline-offset-[3px] hover:decoration-violet-300/50"
                  >
                    fintech.calgary@gmail.com
                  </a>
                </p>
              </section>
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
