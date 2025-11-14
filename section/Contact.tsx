"use client";

import { Mail, Phone, Building, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ContactInfoItemProps = {
  icon: LucideIcon;
  text: string;
};

const ContactInfoItem = ({ icon: Icon, text }: ContactInfoItemProps) => (
  <div className="flex gap-4 items-start">
    <Icon
      className="h-6 w-6 text-emerald-400 shrink-0 mt-1"
      aria-hidden="true"
    />
    <span className="text-lg text-slate-200">{text}</span>
  </div>
);

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative w-full bg-gray-950 text-white px-6 py-24 sm:py-32"
    >
      {/* Subtle background glow from your theme */}
      <div
        className="absolute inset-x-0 -z-10"
        style={{
          background:
            "radial-gradient(at 50% 40%, rgba(16, 185, 129, 0.15), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold leading-7 text-emerald-400 uppercase tracking-wider">
              Contact Us
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight  sm:text-5xl special-text  bg-linear-to-r from-emerald-400 via-white to-emerald-700 bg-clip-text text-transparent">
              Tired of Documentation Slowing You Down?
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Doctors deserve more time with patients—not paperwork. If your
              clinic is struggling with transcription, note-taking, or admin
              overload, reach out. We’re here to help.
            </p>

            {/* Contact Details List */}
            <div className="mt-12 space-y-8">
              <ContactInfoItem icon={Mail} text="support@curamind.com" />
              <ContactInfoItem icon={Phone} text="+1 (555) 123-4567" />
              <ContactInfoItem
                icon={Building}
                text="123 Health Tech Ave, Suite 400, Medville, USA"
              />
            </div>
          </div>

          {/* --- Column 2: Contact Form --- */}
          {/* Styled "glassy" card wrapper */}
          <div className="p-8 lg:p-10 bg-gray-950/70 border border-emerald-900/20 rounded-2xl shadow-2xl shadow-emerald-500/10 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Send us a message
            </h3>

            {/* We can prevent default form submission for this demo */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6 ">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-slate-200"
                  >
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      placeholder="Jane"
                      className="block w-full rounded-md border-0 bg-white/5 py-2 px-3.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-slate-200"
                  >
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autoComplete="family-name"
                      placeholder="Doe"
                      className="block w-full rounded-md border-0 bg-white/5 py-2 px-3.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-slate-200"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane.doe@example.com"
                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-3.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium leading-6 text-slate-200"
                >
                  Message
                </label>
                <div className="mt-2">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="How can we help you today?"
                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-3.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors"
                >
                  Send Message <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
