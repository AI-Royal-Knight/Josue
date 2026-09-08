import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — Tresta",
  description:
    "Learn how Tresta collects, uses, and protects your personal information.",
}

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account & Profile Data",
        text: "When you register or update your profile on Tresta, we collect information such as your name, email address, job title, company name, phone number, and profile picture.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our platform, including pages visited, features used, time spent, IP address, browser type, operating system, and device identifiers.",
      },
      {
        subtitle: "Project & Operational Data",
        text: "We collect data you submit while using the platform, such as project details, timesheets, invoices, quotations, purchase orders, and other construction management records.",
      },
      {
        subtitle: "Communications",
        text: "If you contact our support team or send us feedback, we retain the content of those communications along with your contact details.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Providing & Improving the Service",
        text: "We use your data to operate, maintain, and improve the Tresta platform, including processing transactions, generating reports, and personalising your experience.",
      },
      {
        subtitle: "Communications",
        text: "We may send you service-related emails such as account confirmations, security alerts, and important product updates. With your consent, we may also send promotional content.",
      },
      {
        subtitle: "Analytics & Research",
        text: "Aggregated, anonymised usage data helps us understand how the platform is used so we can make better product decisions.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We may use your information to comply with applicable laws, respond to lawful requests, and protect the rights and safety of Tresta, our users, and the public.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Disclosure",
    content: [
      {
        subtitle: "Within Your Organisation",
        text: "Data you create on Tresta may be visible to other authorised members of your organisation, depending on the roles and permissions configured by your administrator.",
      },
      {
        subtitle: "Service Providers",
        text: "We share data with trusted third-party service providers (e.g., cloud hosting, email delivery, analytics) who process it solely on our behalf and under strict confidentiality obligations.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, regulation, or valid legal process, or if we believe disclosure is necessary to protect the rights, property, or safety of any person.",
      },
      {
        subtitle: "Business Transfers",
        text: "If Tresta is involved in a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you of any such change.",
      },
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      {
        subtitle: "Security Measures",
        text: "We implement industry-standard security measures including TLS encryption in transit, encryption at rest, access controls, and regular security reviews to protect your data.",
      },
      {
        subtitle: "Breach Notification",
        text: "In the event of a data breach that affects your personal information, we will notify you and the relevant authorities as required by applicable law.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: [
      {
        subtitle: "Retention Period",
        text: "We retain your personal data for as long as your account is active or as needed to provide services. After account closure, we may retain certain data for up to 7 years to comply with legal and contractual obligations.",
      },
      {
        subtitle: "Deletion Requests",
        text: "You may request deletion of your personal data at any time by contacting us. We will action your request within 30 days, subject to any legal retention requirements.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You have the right to request a copy of the personal data we hold about you in a structured, machine-readable format.",
      },
      {
        subtitle: "Rectification",
        text: "If any of your personal data is inaccurate or incomplete, you can update it at any time through your profile settings or by contacting us.",
      },
      {
        subtitle: "Erasure & Restriction",
        text: "You have the right to request that we erase your personal data or restrict its processing, subject to applicable law and contractual obligations.",
      },
      {
        subtitle: "Objection & Withdrawal of Consent",
        text: "Where processing is based on consent, you may withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing carried out before withdrawal.",
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use strictly necessary cookies to keep you logged in and maintain your session. These cannot be disabled without affecting platform functionality.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "With your consent, we use analytics cookies to understand how the platform is used. You can manage cookie preferences through your browser settings.",
      },
    ],
  },
  {
    id: "contact",
    title: "8. Contact Us",
    content: [
      {
        subtitle: "Data Controller",
        text: "Tresta is the data controller responsible for your personal information. If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our team.",
      },
      {
        subtitle: "Email",
        text: "privacy@tresta.co.uk",
      },
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[oklch(19.76%_0.037_264.19)] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white hover:text-emerald-300 transition-colors"
          >
            Tresta
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/terms-of-service"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Support
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        {/* Hero */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            We take your privacy seriously. This policy explains what data we
            collect, how we use it, and the rights you have over it.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>
              Effective date:{" "}
              <span className="text-slate-300">1 August 2025</span>
            </span>
            <span className="hidden text-slate-700 sm:block">·</span>
            <span>
              Last updated:{" "}
              <span className="text-slate-300">30 July 2026</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Table of Contents — sticky sidebar */}
          <aside className="shrink-0 lg:w-56">
            <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Contents
              </p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-emerald-300"
                  >
                    {s.title.replace(/^\d+\.\s/, "")}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Intro card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5">
              <p className="text-sm leading-7 text-slate-300">
                By using Tresta you agree to this Privacy Policy. If you do not
                agree, please do not use the platform. We may update this policy
                from time to time; continued use after changes constitutes
                acceptance of the revised policy.
              </p>
            </div>

            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-colors hover:border-white/20"
              >
                <h2 className="mb-5 text-lg font-semibold text-white">
                  {section.title}
                </h2>
                <div className="space-y-5">
                  {section.content.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <div>
                        <p className="mb-1 text-sm font-semibold text-slate-200">
                          {item.subtitle}
                        </p>
                        <p className="text-sm leading-7 text-slate-400">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Footer note */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center">
              <p className="text-sm text-slate-400">
                Have a question about your data?{" "}
                <Link
                  href="/support"
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Contact our support & privacy team →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-8 px-6 text-xs text-slate-400">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} Tresta Platform. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-200 transition-colors">
              Home
            </Link>
            <Link href="/terms-of-service" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-slate-200 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
