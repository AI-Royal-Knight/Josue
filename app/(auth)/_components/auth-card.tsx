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
        "auth-glass w-full max-w-[420px] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur-sm",
        className
      )}
    >
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-[0.2em] uppercase">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-xs text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-6 space-y-5">{children}</div>
      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </div>
  )
}
