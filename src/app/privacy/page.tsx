export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
            Legal
          </p>
          <h1
            className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-12">
            Last updated: February 2026
          </p>

          <div className="space-y-12">
            {[
              {
                title: 'What We Collect',
                body: 'Tree of Hope collects your email address for authentication (magic link sign-in), your name if you choose to leave a leaf (message of hope), and payment information processed securely through Stripe. We do not store credit card numbers.',
              },
              {
                title: 'How We Use Your Information',
                body: 'Your email is used solely for authentication, commitment receipts, and sanctuary access. Your leaf messages are displayed on the campaign tree (publicly or anonymously, as you choose). We do not sell or share your personal information with third parties.',
              },
              {
                title: 'Sanctuary Privacy',
                body: 'The Sanctuary is a private space. Journal entries, appointment records, medication logs, symptom tracking, and task lists are visible only to the patient and caregiver who claimed the Sanctuary. Tree of Hope staff may access this data only for technical support purposes.',
              },
              {
                title: 'Payments',
                body: 'All payments are processed by Stripe. Tree of Hope is a for-profit service. Your contribution funds the Sanctuary and ongoing platform operations. Funds are not transferred to the patient or caregiver. You can pause your commitment for hardship at any time.',
              },
              {
                title: 'Cookies & Analytics',
                body: 'We use essential cookies for authentication. We track anonymous analytics events (page views, funnel steps) to improve the product. We do not use third-party advertising trackers.',
              },
              {
                title: 'Your Rights',
                body: 'You may request deletion of your account and all associated data at any time by contacting hello@treeofhope.com. You may also request a copy of your data.',
              },
              {
                title: 'Contact',
                body: 'Questions about this policy? Contact us at hello@treeofhope.com.',
              },
            ].map((section) => (
              <div key={section.title}>
                <h2
                  className="text-2xl font-bold text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {section.title}
                </h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
