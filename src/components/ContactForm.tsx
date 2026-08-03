'use client';

import { useState } from 'react';

// Change this to the address you want contact messages to go to.
export const CONTACT_EMAIL = 'sczainaqdas@gmail.com';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject || 'Contact from JavOnlineHD'
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-white/60 text-sm font-medium mb-1.5">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-all"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-white/60 text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-white/60 text-sm font-medium mb-1.5">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="How can we help?"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-all"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-white/60 text-sm font-medium mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Write your message..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-all resize-y"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5"
      >
        Send Message
      </button>

      <p className="text-white/30 text-xs text-center">
        This opens your default email app with the message pre-filled. You can also email us directly at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-400 hover:text-red-300 transition-colors">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
