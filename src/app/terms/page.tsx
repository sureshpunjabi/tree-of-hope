export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-12">
            Last updated: February 2026
          </p>

          <div className="space-y-12">
            {[
              {
                title: 'Acceptance of Terms',
                body: 'By accessing and using Tree of Hope, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, please do not use the service.',
              },
              {
                title: 'Service Description',
                body: 'Tree of Hope is a digital platform that enables supporters to contribute monthly support for individuals facing hardship. The platform includes: (1) a Campaign Tree where supporters leave messages during a five-day gathering; (2) a private Sanctuary for the patient and caregiver with guided content, journaling tools, and self-care features; and (3) Bridge, which connects GoFundMe donors to ongoing monthly support.',
              },
              {
                title: 'Payments and Billing',
                body: 'Contributions are recurring monthly charges unless you pause your commitment. All payments are processed securely through Stripe. Tree of Hope is a for-profit service — your contribution funds the Sanctuary, platform infrastructure, and operations. Funds are not transferred to the patient or their family. You will be charged on the date you sign up and on the same date each month thereafter, until you pause or cancel.',
              },
              {
                title: 'Hardship Pause',
                body: 'You may pause your monthly contribution at any time without penalty, no questions asked. Pausing your commitment does not delete your account or messages. You may resume your contribution at any time.',
              },
              {
                title: 'Privacy and Data',
                body: 'Your data is protected as outlined in our Privacy Policy. The Sanctuary is a fully private space where journal entries, medication logs, appointment records, and symptom tracking are visible only to the patient and caregiver. Tree of Hope staff access this data only for technical support. We do not sell your personal information to third parties.',
              },
              {
                title: 'Intellectual Property',
                body: 'All content on Tree of Hope, including the platform design, guided content, journal templates, and educational materials, is owned by or licensed to Tree of Hope and protected by copyright. Your leaf messages (messages of hope) are your original work, and you grant Tree of Hope a non-exclusive license to display them on the campaign tree (publicly or anonymously, as you choose).',
              },
              {
                title: 'Limitation of Liability',
                body: 'Tree of Hope is provided "as is" without warranties of any kind. To the fullest extent permitted by law, Tree of Hope and its team are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability is limited to the amount you have paid in the past 12 months.',
              },
              {
                title: 'Changes to Terms',
                body: 'We may update these Terms of Service at any time. Material changes will be communicated to you via email at least 30 days before they take effect. Your continued use of Tree of Hope after changes become effective constitutes your acceptance of the updated terms.',
              },
              {
                title: 'Contact',
                body: 'Questions about these Terms of Service? Reach out to us at hello@treeofhope.com. We are here to help.',
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
