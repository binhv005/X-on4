"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Your Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) {
      errors.message = "Please enter your message.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please fill in all required fields indicated below.");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject || "General Inquiry",
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setErrorMessage(data.message || "Failed to submit message. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white min-h-screen py-16 sm:py-24 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="contact" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            We&apos;re Here For You
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-gray-950 mt-1 font-serif">
            Contact X-ON
          </h1>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Have questions about nail sizing, orders, wholesale partnerships, or application tips? Our team is always ready to help.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details (1 col) */}
          <div className="space-y-8 bg-neutral-50 p-8 rounded-2xl border border-gray-100">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wide text-gray-950 mb-4">
                Direct Contact
              </h3>
              <div className="space-y-4 text-xs text-gray-600">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-neutral-900 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 font-semibold mb-0.5">
                      Phone &amp; SMS
                    </strong>
                    <a href="tel:+16892128888" className="hover:text-black font-semibold text-neutral-900 block">
                      689-212-8888
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-neutral-900 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 font-semibold mb-0.5">
                      Email
                    </strong>
                    <a href="mailto:info@x-on.com" className="hover:text-black block">
                      info@x-on.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-900 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 font-semibold mb-0.5">
                      Address
                    </strong>
                    <a
                      href="https://www.google.com/maps/place/3168+Bill+Beck+Blvd,+Kissimmee,+FL+34744,+Hoa+K%E1%BB%B3/@28.3421851,-81.384924,96m/data=!3m1!1e3!4m6!3m5!1s0x88dd86f7f805bafd:0x719187b51bbcb7ff!8m2!3d28.3423066!4d-81.3845875!16s%2Fg%2F11bw40bzvw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-black transition-colors"
                    >
                      3168 Bill Beck Blvd, Kissimmee Fl 34744
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-neutral-900 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-gray-900 font-semibold mb-0.5">
                      Operating Hours
                    </strong>
                    <span>Monday – Sunday: 9:00 AM – 6:00 PM EST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-2">
                Need Help with Sizing?
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Take a quick photo of your natural nail next to a coin and text us at 689-212-8888 for instant size confirmation!
              </p>
            </div>
          </div>

          {/* Form (2 cols) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-600" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Thank you for reaching out to X-ON. A team member will respond to your inquiry within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-base font-bold uppercase tracking-wide text-gray-950">
                  Send Us a Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      placeholder="Jane Doe"
                      className={`w-full px-4 py-2.5 text-xs border rounded-md focus:outline-hidden ${
                        fieldErrors.name
                          ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                          : "border-gray-200 focus:border-black"
                      }`}
                    />
                    {fieldErrors.name && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                      }}
                      placeholder="jane@example.com"
                      className={`w-full px-4 py-2.5 text-xs border rounded-md focus:outline-hidden ${
                        fieldErrors.email
                          ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                          : "border-gray-200 focus:border-black"
                      }`}
                    />
                    {fieldErrors.email && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="689-212-8888"
                      className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-hidden focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-hidden focus:border-black bg-white"
                    >
                      <option value="">Select a topic...</option>
                      <option value="sizing">Nail Sizing Question</option>
                      <option value="order">Order Status &amp; Shipping</option>
                      <option value="wholesale">Wholesale &amp; Retail Inquiry</option>
                      <option value="other">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: "" });
                    }}
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-4 py-2.5 text-xs border rounded-md focus:outline-hidden resize-y ${
                      fieldErrors.message
                        ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                  {fieldErrors.message && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.message}
                    </span>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-widest rounded-md shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
