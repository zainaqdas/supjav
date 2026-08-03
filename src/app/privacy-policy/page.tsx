import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the JavOnlineHD privacy policy — learn what data we collect (minimal), how it is used, and your rights as a visitor.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl lg:text-5xl font-bold text-center relative">
          <span className="gradient-text">Privacy Policy</span>
        </h1>
        <p className="text-white/40 text-center mt-3">Last updated: August 2026</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 text-white/50 text-[15px] leading-relaxed">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Introduction</h2>
          <p>
            JavOnlineHD (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website at
            javhdonline.vercel.app. This Privacy Policy explains what information we collect when you visit our
            website and how that information is used. By using JavOnlineHD, you agree to the practices described in
            this policy. If you disagree with any part of it, please do not use the site.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Information We Collect</h2>
          <p>
            We are a free, no-sign-up streaming site, so we intentionally collect very little information:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li><span className="text-white/70">No accounts and no personal data.</span> We do not ask you to register, and we do not collect your name, email address, or any other identifying information.</li>
            <li><span className="text-white/70">Server and network logs.</span> Like virtually every website, our hosting provider (Vercel) records standard technical logs — such as IP address, browser type, pages requested, and timestamps — for security, debugging, and performance monitoring. These logs are used in aggregate and are not used to identify individuals.</li>
            <li><span className="text-white/70">Cookies.</span> We do not set tracking cookies. Any cookies present come from your browser or third-party services described below.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">How We Use Information</h2>
          <p>
            Any technical information we have access to is used solely to: operate and maintain the website, monitor
            performance and uptime, diagnose errors, protect the site against abuse and automated traffic, and
            improve the user experience. We do not sell, rent, or share personal information with third parties for
            marketing purposes.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Third-Party Services</h2>
          <p>
            JavOnlineHD is hosted on Vercel, which processes requests and may retain logs per its own privacy
            policy. Video content and thumbnails are streamed from third-party content delivery networks and source
            providers. We may also add privacy-respecting analytics in the future; if we do, this policy will be
            updated accordingly. These third parties have their own privacy policies, and we encourage you to review
            them.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Children&apos;s Privacy</h2>
          <p>
            JavOnlineHD contains adult content and is intended exclusively for adults aged 18 and over. We do not
            knowingly collect any information from anyone under the age of 18. If you believe a minor has provided
            information through our site, please contact us so we can address it.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Your Rights &amp; Contact</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, or delete personal data
            concerning you. Because we do not collect personal data beyond standard technical logs, there is
            typically nothing personal to access or delete. If you have questions about this policy or our practices,
            reach out through our contact page and we will respond as promptly as possible.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated revision date. Continued use of the site after changes are posted constitutes acceptance of the
            revised policy.
          </p>
        </div>
      </div>
    </div>
  );
}
