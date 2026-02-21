'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
            Support
          </p>
          <h1
            className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Get in touch.
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-8 leading-relaxed">
            Have a question about Tree of Hope? Want to share feedback or talk about bringing this to your community?
            We&apos;d love to hear from you.
          </p>

          {/* Email */}
          <div className="inline-block mb-12">
            <a
              href="mailto:hello@treeofhope.com"
              className="text-xl font-semibold text-[var(--color-hope)] hover:underline transition-colors"
            >
              hello@treeofhope.com
            </a>
          </div>
        </div>
      </section>

      {/* ─── CONTACT FORM ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-b from-[#f9f7f4] to-[#f5f1eb] p-8 md:p-12 border border-[var(--color-border)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                  Your name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] focus:border-transparent transition-all duration-200"
                  placeholder="Sarah Chen"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] focus:border-transparent transition-all duration-200"
                  placeholder="sarah@example.com"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-6 py-3 rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              {/* Submit Status */}
              {submitStatus === 'success' && (
                <div className="p-4 rounded-2xl bg-[#e8f5e9] border border-[#c8e6c9]">
                  <p className="text-[#2e7d32] font-semibold">
                    Thank you for reaching out. We'll be in touch soon.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 rounded-2xl bg-[#ffebee] border border-[#ffcdd2]">
                  <p className="text-[#c62828] font-semibold">
                    Something went wrong. Please try again or email us directly at hello@treeofhope.com.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] disabled:bg-[var(--color-text-muted)] text-white font-semibold py-4 px-8 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── TRUST LANGUAGE FOOTER ─── */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="trust-language">
          <p>
            We take your privacy seriously. Your message will be read by our team and kept confidential.
            Tree of Hope is a for-profit service dedicated to supporting communities through hardship.
          </p>
        </div>
      </section>
    </div>
  )
}
