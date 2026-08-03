import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Read the JavOnlineHD terms and conditions — 18+ eligibility, acceptable use, content disclaimer, and limitation of liability.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl lg:text-5xl font-bold text-center relative">
          <span className="gradient-text">Terms &amp; Conditions</span>
        </h1>
        <p className="text-white/40 text-center mt-3">Last updated: August 2026</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 text-white/50 text-[15px] leading-relaxed">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using JavOnlineHD, you agree to be bound by these Terms &amp; Conditions and our
            Privacy Policy. If you do not agree with any part of these terms, you must not use the website.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">2. Eligibility — Adults Only (18+)</h2>
          <p>
            JavOnlineHD contains sexually explicit adult content and is intended for adults aged 18 or older (or the
            age of majority in your jurisdiction, whichever is higher). By using the site you confirm that you are of
            legal adult age in your location and that accessing adult content is legal where you live. We do not
            knowingly permit anyone under 18 to use the site.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">3. Description of Service</h2>
          <p>
            JavOnlineHD provides a free, searchable index and streaming interface for Japanese adult video content.
            We aggregate metadata — titles, thumbnails, descriptions, codes, and stream links — to help you discover
            and watch videos. The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            express or implied.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Use the site in any way that violates applicable law or regulations.</li>
            <li>Attempt to disrupt, overload, or gain unauthorized access to the site or its infrastructure.</li>
            <li>Scrape, crawl, or harvest content in a manner that exceeds normal browsing or that we deem abusive.</li>
            <li>Redistribute or resell any content from the site without authorization.</li>
            <li>Use automated tools (including AI crawlers) to mass-download videos or metadata.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">5. Content &amp; Copyright</h2>
          <p>
            JavOnlineHD does not host, upload, or produce video files. Videos are streamed from third-party
            providers, and all titles, trademarks, and copyrighted works belong to their respective owners and
            rights holders. Our site functions as a discovery and navigation interface. If you are a rights holder
            and believe content linked or referenced on our site infringes your rights, please contact us through
            the <Link href="/contact" className="text-red-400 hover:text-red-300 transition-colors">contact page</Link>,
            and we will review and remove the relevant references promptly upon a valid request.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">6. Disclaimer of Warranties</h2>
          <p>
            The service and all content are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no
            representations or warranties regarding the availability, accuracy, reliability, or suitability of the
            service, and we disclaim all warranties to the maximum extent permitted by law, including implied
            warranties of merchantability and fitness for a particular purpose.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, JavOnlineHD and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data,
            arising out of or in connection with your use of the website.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">8. Changes &amp; Contact</h2>
          <p>
            We may revise these Terms &amp; Conditions at any time; the latest version will always be posted here.
            Continued use of the site after changes constitutes acceptance. Questions about these terms can be sent
            through our <Link href="/contact" className="text-red-400 hover:text-red-300 transition-colors">contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
