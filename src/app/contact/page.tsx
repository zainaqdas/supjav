import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with JavOnlineHD — questions, feedback, and takedown requests. Reach us through the contact form or email.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl lg:text-5xl font-bold text-center relative">
          <span className="gradient-text">Contact Us</span>
        </h1>
        <p className="text-white/40 text-center mt-3 max-w-xl mx-auto">
          Questions, feedback, or takedown requests — we&apos;d love to hear from you.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  );
}
