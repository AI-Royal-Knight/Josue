import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "auth-glass w-full max-w-[440px] rounded-3xl border border-white/20 bg-black/40 p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.7)] backdrop-blur-md relative overflow-hidden",
        className
      )}
    >
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-2xl font-bold tracking-[0.15em] uppercase text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-sm text-slate-300 tracking-wide">{subtitle}</p>
        ) : null}
      </div>
      <div className="relative z-10 space-y-6">{children}</div>
      {footer ? <div className="relative z-10 mt-8 text-center">{footer}</div> : null}
    </div>
  )
}
