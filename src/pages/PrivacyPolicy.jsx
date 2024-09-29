import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#151515] text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1E1C24] mb-4">
            NikoKadi Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl">Your privacy is our priority</p>
        </header>

        <main className="space-y-8">
          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Introduction
            </h2>
            <p>
              At NikoKadi, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy outlines our practices concerning the collection, use, and
              protection of your data when you use our game and related
              services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Information We Collect
            </h2>
            <p className="mb-4">
              To provide and improve our services, we collect the following
              types of information:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Account Information: Username, email address, and password</li>
              <li>Game Data: Your game progress, statistics, and in-game purchases</li>
              <li>Device Information: Device type, operating system, and unique device identifiers</li>
              <li>Usage Data: How you interact with our game, including game sessions and feature usage</li>
              <li>Communication Data: Messages sent through our in-game chat feature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your game account</li>
              <li>To provide and maintain our game services</li>
              <li>To improve our game and user experience</li>
              <li>To facilitate multiplayer functionality and chat features</li>
              <li>To track game progress and user statistics</li>
              <li>To prevent cheating and ensure fair play</li>
              <li>To communicate important updates and announcements</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Data Protection
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data from unauthorized access, disclosure, alteration, and
              destruction. These measures include encryption, secure socket
              layer technology, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Third-Party Services
            </h2>
            <p>
              We may use third-party services for analytics, payment processing,
              and other game functionality. These services have their own
              privacy policies, and we encourage you to review them. We only
              work with reputable partners who maintain high standards of data
              protection.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Your Rights
            </h2>
            <p className="mb-4">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access: You can request access to the personal data we hold about you</li>
              <li>Correction: You can ask us to correct any inaccurate or incomplete data</li>
              <li>Deletion: You can request the deletion of your personal data</li>
              <li>Restriction: You can ask us to restrict the processing of your data</li>
              <li>Data Portability: You can request a copy of your data in a machine-readable format</li>
            </ul>
            <p className="mt-4">
              To exercise these rights or for any privacy-related concerns,
              please contact our Data Protection Officer at{" "}
              <a
                href="mailto:privacy@nikokadi.com"
                className="text-[#1E1C24] underline"
              >
                privacy@nikokadi.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Policy Updates
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. We will notify you of any material changes
              through our game or website. We encourage you to review this
              policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-[#1E1C24] mb-4">
              Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please don't hesitate to
              contact us at:
            </p>
            <p className="mt-2">
              NikoKadi Privacy Team<br />
              Email:{" "}
              <a
                href="mailto:privacy@nikokadi.com"
                className="text-[#1E1C24] underline"
              >
                privacy@nikokadi.com
              </a>
              <br />
              Address: [Your Company Address]
            </p>
          </section>

          <section className="text-center">
            <p className="text-xl mb-4">
              By using NikoKadi, you agree to the terms outlined in this Privacy
              Policy. Thank you for trusting us with your information as you
              enjoy our game!
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
