import type { ReactNode } from "react"
import { Space_Grotesk } from "next/font/google"
import signinBg from "@/assets/images/Sign-in.png"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className={`${spaceGrotesk.className} relative min-h-screen overflow-hidden bg-[#101722] text-white`}
    >
      {/* Background image + overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(
              120deg,
              rgba(11,16,24,0.88) 0%,
              rgba(11,16,24,0.68) 55%,
              rgba(11,16,24,0.45) 100%
            ),
            url(${signinBg.src})
          `,
        }}
      />

      {/* Decorative glow effects */}
      <div
        aria-hidden="true"
        className="absolute top-20 -right-40 h-[420px] w-[420px] rounded-full bg-[#2b5bd7]/20 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-10 -left-28 h-[320px] w-[320px] rounded-full bg-[#1f3f7a]/30 blur-[120px]"
      />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  )
}
