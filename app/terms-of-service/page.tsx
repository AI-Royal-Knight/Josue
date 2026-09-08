import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — Tresta",
  description:
    "Read the terms and conditions governing the use of the Tresta construction and procurement management platform.",
}

const sections = [
  {
    id: "acceptance-of-terms",
    title: "1. Acceptance of Terms",
    content: [
      {
        subtitle: "Contractual Relationship",
        text: "By registering for, accessing, or using the Tresta platform, mobile applications, APIs, or related services (collectively, the 'Service'), you enter into a legally binding agreement with Tresta ('we', 'us', or 'our'). If you are using the Service on behalf of a company or legal entity, you represent and warrant that you have full legal authority to bind that entity to these Terms.",
      },
      {
        subtitle: "Modifications",
        text: "We reserve the right to amend these Terms from time to time. We will provide notice of material changes by posting the revised Terms on this page with an updated effective date. Your continued use of the Service following such notice constitutes acceptance of the revised Terms.",
      },
    ],
  },
  {
    id: "eligibility-and-accounts",
    title: "2. Account Registration & Security",
    content: [
      {
        subtitle: "Eligibility",
        text: "You must be at least 18 years of age and legally capable of entering into binding contracts to register an account or use Tresta.",
      },
      {
        subtitle: "Account Accuracy",
        text: "You agree to provide accurate, current, and complete information during registration and to maintain and update your information as needed to keep it accurate.",
      },
      {
        subtitle: "Credential Safeguarding",
        text: "You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately at security@tresta.co.uk upon becoming aware of any unauthorised access or breach of security.",
      },
    ],
  },
  {
    id: "roles-and-permissions",
    title: "3. Roles & Organisational Hierarchy",
    content: [
      {
        subtitle: "Role-Based Access Control",
        text: "Tresta employs strict role-based access control. Permissions, project assignments, and administrative privileges (including Company Admin, Project Admin, Procurement Department, Commercial Department, Managers, Supervisors, and Document Controllers) are configured and managed by your organisation's administrators.",
      },
      {
        subtitle: "Administrative Responsibility",
        text: "Organisation administrators are solely responsible for provisioning, monitoring, and revoking user access, invitations, and role assignments within their respective enterprise accounts.",
      },
    ],
  },
  {
    id: "procurement-and-commercial",
    title: "4. Procurement, Quotations & Purchase Orders",
    content: [
      {
        subtitle: "Requests for Quotation (RFQs)",
        text: "Procurement teams issue RFQs and purchase orders through the platform. Quotations submitted by suppliers or subcontractors are legally binding offers once accepted and approved according to configured authorisation workflows.",
      },
      {
        subtitle: "Authorisation & Electronic Signatures",
        text: "Electronic signatures and multi-stage sign-offs executed via Tresta (including by Procurement, Contracts Managers, Project Directors, and Managing Directors) constitute valid, enforceable authorizations for order commitments and project contracts.",
      },
      {
        subtitle: "Call-Off Orders",
        text: "Call-off orders generated against approved purchase orders bind the ordering entity to the agreed schedule and quantity upon approval and formal notification.",
      },
    ],
  },
  {
    id: "supplier-portal",
    title: "5. Supplier Portal & Invoicing",
    content: [
      {
        subtitle: "Supplier Invitations & Multi-Company Relationships",
        text: "Suppliers may connect to multiple hiring companies using a single verified account upon receiving and accepting dedicated procurement invitations.",
      },
      {
        subtitle: "Invoice Submission",
        text: "Suppliers submitting invoices via the Supplier Portal agree to provide accurate billing numbers, line item charges, and supporting documentation. Submission does not guarantee payment until processed and approved by the recipient company's procurement department.",
      },
      {
        subtitle: "Credit Terms",
        text: "Payment schedules, credit limits, and End of Month (EOM) payment terms are governed by the specific agreements established between the supplier and the hiring company.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable Use Policy",
    content: [
      {
        subtitle: "Prohibited Conduct",
        text: "You agree not to: (a) reverse engineer, decompile, or extract source code from Tresta; (b) introduce viruses, worms, or harmful code; (c) attempt unauthorized access to platform servers, user databases, or third-party integrations; (d) upload defamatory, unlawful, or infringing content; or (e) use automated scrapers or bots to harvest data from the platform.",
      },
      {
        subtitle: "Compliance with Laws",
        text: "You agree to comply with all applicable local, national, and international laws and construction regulations when using the platform.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property & Ownership",
    content: [
      {
        subtitle: "Tresta Intellectual Property",
        text: "Tresta, its logos, software architecture, UI design, documentation, and underlying code are the exclusive property of Tresta and its licensors, protected by copyright, trademark, and intellectual property laws.",
      },
      {
        subtitle: "Customer Data Ownership",
        text: "You retain all ownership rights to the drawings, project data, photos, financial figures, and business records that you upload to the platform ('Customer Data'). You grant Tresta a non-exclusive license to host, process, and transmit Customer Data solely to provide and maintain the Service.",
      },
    ],
  },
  {
    id: "service-availability",
    title: "8. Platform Availability & Maintenance",
    content: [
      {
        subtitle: "Service Levels",
        text: "We strive to maintain 99.9% platform availability. However, the Service is provided on an 'as-is' and 'as-available' basis. We do not warrant that operation will be completely uninterrupted or error-free.",
      },
      {
        subtitle: "Scheduled Maintenance",
        text: "We will make reasonable efforts to announce scheduled maintenance and downtime in advance through system notifications or platform announcements.",
      },
    ],
  },
  {
    id: "limitation-of-liability",
    title: "9. Limitation of Liability & Indemnification",
    content: [
      {
        subtitle: "Exclusion of Consequential Damages",
        text: "To the maximum extent permitted by applicable law, in no event shall Tresta, its directors, employees, or partners be liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profits, data, goodwill, or project delays.",
      },
      {
        subtitle: "Cap on Liability",
        text: "Our total aggregate liability arising out of or related to these Terms or the Service shall not exceed the amounts paid by your organisation to Tresta in the 12 months preceding the event giving rise to liability.",
      },
      {
        subtitle: "Indemnification",
        text: "You agree to defend, indemnify, and hold harmless Tresta from and against any claims, liabilities, damages, losses, and expenses arising out of your violation of these Terms or misuse of the platform.",
      },
    ],
  },
  {
    id: "termination",
    title: "10. Termination & Suspension",
    content: [
      {
        subtitle: "Termination by You",
        text: "You may terminate your account at any time by contacting our support team or through account administration settings, subject to existing contractual subscriptions.",
      },
      {
        subtitle: "Suspension by Tresta",
        text: "We reserve the right to suspend or terminate your access immediately if you breach these Terms, engage in fraudulent activity, or fail to pay applicable fees.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "11. Governing Law & Jurisdiction",
    content: [
      {
        subtitle: "Jurisdiction",
        text: "These Terms and any disputes arising out of or related to them shall be governed by and construed in accordance with the laws of England and Wales.",
      },
      {
        subtitle: "Dispute Resolution",
        text: "The courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms.",
      },
    ],
  },
  {
    id: "contact",
    title: "12. Contact & Legal Notices",
    content: [
      {
        subtitle: "Legal Queries",
        text: "For questions regarding these Terms or legal notices, please reach out to our legal department.",
      },
      {
        subtitle: "Email",
        text: "legal@tresta.co.uk",
      },
    ],
  },
]

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Please read these terms carefully before accessing or using the Tresta
            construction management platform.
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
              <nav className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-emerald-300 leading-snug"
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
                These Terms of Service govern your relationship with Tresta. By
                signing up, logging in, or using any part of the platform, you
                confirm that you have read, understood, and agreed to these Terms
                and our{" "}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
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
                Need clarification or have enterprise contract questions?{" "}
                <Link
                  href="/support"
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Contact our support & legal team →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
