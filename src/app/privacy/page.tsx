export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-8"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Privacy Policy
          </h1>

          <div className="prose prose-lg text-[var(--color-text-muted)] space-y-6">
            <p className="text-sm text-[var(--color-text-muted)]">
              Last updated: February 2026
            </p>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                What We Collect
              </h2>
              <p>
                Tree of Hope collects your email address for authentication (magic link sign-in),
                your name if you choose to leave a leaf (message of hope), and payment information
                processed securely through Stripe. We do not store credit card numbers.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                How We Use Your Information
              </h2>
              <p>
                Your email is used solely for authentication, commitment receipts, and
                sanctuary access. Your leaf messages are displayed on the campaign tree
                (publicly or anonymously, as you choose). We do not sell or share your
                personal information with third parties.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Sanctuary Privacy
              </h2>
              <p>
                The Sanctuary is a private space. Journal entries, appointment records,
                medication logs, symptom tracking, and task lists are visible only to the
                patient and caregiver who claimed the Sanctuary. Tree of Hope staff may
                access this data only for technical support purposes.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Payments
              </h2>
              <p>
                All payments are processed by Stripe. Tree of Hope is a for-profit service.
                Your contribution funds the Sanctuary and ongoing platform operations. Funds
                are not transferred to the patient or caregiver. You can pause your commitment
                for hardship at any time.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Cookies &amp; Analytics
              </h2>
              <p>
                We use essential cookies for authentication. We track anonymous analytics
                events (page views, funnel steps) to improve the product. We do not use
                third-party advertising trackers.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your Rights
              </h2>
              <p>
                You may request deletion of your account and all associated data at any time
                by contacting hello@treeofhope.com. You may also request a copy of your data.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[var(--color-text)] mt-8 mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Contact
              </h2>
              <p>
                Questions about this policy? Contact us at{' '}
                <a
                  href="mailto:hello@treeofhope.com"
                  className="text-[var(--color-hope)] hover:underline"
                >
                  hello@treeofhope.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
