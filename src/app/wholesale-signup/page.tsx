"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

export default function WholesaleSignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    contactName: "",
    businessName: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.contactName.trim()) {
      errors.contactName = "Contact Name is required.";
    }
    if (!formData.businessName.trim()) {
      errors.businessName = "Business / Salon Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Business Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone Number is required.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete all required fields indicated below.");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: formData.contactName.trim(),
          businessName: formData.businessName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          website: formData.website.trim(),
          taxId: formData.taxId.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || "Failed to submit wholesale application.");
      }
    } catch {
      setErrorMessage("Network connection error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white min-h-screen py-16 sm:py-24 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="wholesale" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Partner with X-ON
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-gray-950 font-serif">
            Wholesale Account Application
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
            Become an official retailer or salon partner of X-ON&apos;s handmade press-on nails and professional nail essentials.
          </p>
        </div>

        {/* Benefits banner */}
        <div className="bg-neutral-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-xl font-bold text-gray-950">40–60%</span>
            <p className="text-xs text-gray-500 mt-1">Wholesale Margins</p>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-950">Low MOQ</span>
            <p className="text-xs text-gray-500 mt-1">Flexible Starter Kits</p>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-950">Fast Shipping</span>
            <p className="text-xs text-gray-500 mt-1">US-Based Stock</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold uppercase text-gray-950">
                Application Submitted!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you for applying for an X-ON wholesale account. Our wholesale accounts manager will review your business credentials and contact you within 1–2 business days.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-4 px-6 py-2.5 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-full hover:bg-neutral-800 transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData({ ...formData, contactName: e.target.value });
                      if (fieldErrors.contactName) {
                        setFieldErrors({ ...fieldErrors, contactName: "" });
                      }
                    }}
                    placeholder="Full Name"
                    className={`w-full px-4 py-2.5 text-xs border rounded-md focus:outline-hidden ${
                      fieldErrors.contactName
                        ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                  {fieldErrors.contactName && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.contactName}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({ ...formData, businessName: e.target.value });
                      if (fieldErrors.businessName) {
                        setFieldErrors({ ...fieldErrors, businessName: "" });
                      }
                    }}
                    placeholder="Boutique / Salon Name"
                    className={`w-full px-4 py-2.5 text-xs border rounded-md focus:outline-hidden ${
                      fieldErrors.businessName
                        ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                  {fieldErrors.businessName && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.businessName}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: "" });
                      }
                    }}
                    placeholder="orders@business.com"
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
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (fieldErrors.phone) {
                        setFieldErrors({ ...fieldErrors, phone: "" });
                      }
                    }}
                    placeholder="(555) 000-0000"
                    className={`w-full px-4 py-2.5 text-xs border rounded-md focus:outline-hidden ${
                      fieldErrors.phone
                        ? "border-rose-500 bg-rose-50/30 focus:border-rose-600"
                        : "border-gray-200 focus:border-black"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Website or Social Handle
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="instagram.com/yoursalon"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-hidden focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Tax ID / Reseller Permit #
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="Tax ID Number"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Business Details &amp; Estimated Volume
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your store, client base, and the product lines you are interested in..."
                  className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-hidden focus:border-black resize-y"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-widest rounded-md shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isSubmitting ? "Submitting..." : "Submit Wholesale Application"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
